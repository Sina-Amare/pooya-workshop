// Screenshot harness: captures public + admin pages at desktop and mobile sizes.
// Usage: node shoot.mjs <outputDir> [baseUrl]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const outDir = process.argv[2] || "shots";
const base = process.argv[3] || "http://localhost:3000";
mkdirSync(outDir, { recursive: true });

const publicPages = [
  ["home", "/"],
  ["works", "/works"],
  ["project", "/works/" + encodeURIComponent("آشپزخانه-مدرن-با-جزیره-چوبی")],
  ["about", "/about"],
  ["contact", "/contact"],
  ["notfound", "/works/does-not-exist"],
  ["admin-login", "/admin/login"],
];
const adminPages = [
  ["admin-dash", "/admin"],
  ["admin-projects", "/admin/projects"],
  ["admin-project-new", "/admin/projects/new"],
  ["admin-categories", "/admin/categories"],
  ["admin-settings", "/admin/settings"],
];
const viewports = [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
];

const browser = await chromium.launch();

for (const [vpName, viewport] of viewports) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });

  // Log console errors per page
  const errors = [];
  context.on("page", (page) => {
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(`[${page.url()}] ${msg.text()}`);
    });
    page.on("pageerror", (err) => errors.push(`[${page.url()}] PAGEERROR ${err.message}`));
  });

  const page = await context.newPage();

  async function scrollThrough() {
    // Trigger reveal animations and lazy images down the whole page.
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.7;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
      // Deterministic captures: force any not-yet-observed reveals visible
      // (equivalent to a fully-scrolled user).
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    });
    // Wait until every visible image has actually finished decoding.
    await page
      .waitForFunction(
        () =>
          Array.from(document.querySelectorAll("img")).every(
            (img) => img.complete && img.naturalWidth > 0,
          ),
        { timeout: 45000 },
      )
      .catch(() => console.log("  (warning: some images never completed)"));
    await page.waitForTimeout(700);
  }

  for (const [name, url] of publicPages) {
    try {
      await page.goto(base + url, { waitUntil: "networkidle", timeout: 30000 });
      await scrollThrough();
      await page.screenshot({ path: path.join(outDir, `${name}-${vpName}.png`), fullPage: true });
      console.log(`ok ${name}-${vpName}`);
    } catch (e) {
      console.log(`FAIL ${name}-${vpName}: ${e.message.split("\n")[0]}`);
    }
  }

  // Login for admin pages
  const login = await page.request.post(base + "/api/admin/login", {
    data: { password: process.env.ADMIN_PASSWORD || "admin" },
  });
  console.log("login status:", login.status());

  for (const [name, url] of adminPages) {
    try {
      await page.goto(base + url, { waitUntil: "networkidle", timeout: 30000 });
      await scrollThrough();
      await page.screenshot({ path: path.join(outDir, `${name}-${vpName}.png`), fullPage: true });
      console.log(`ok ${name}-${vpName}`);
    } catch (e) {
      console.log(`FAIL ${name}-${vpName}: ${e.message.split("\n")[0]}`);
    }
  }

  if (errors.length) {
    console.log(`--- console errors (${vpName}) ---`);
    for (const e of [...new Set(errors)].slice(0, 20)) console.log(e);
  }
  await context.close();
}

await browser.close();
console.log("done");
