// Admin flow end-to-end test: exercises the real owner journey against a dev server.
// Usage: node scripts/e2e-admin.mjs [baseUrl]
import { chromium } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const base = process.argv[2] || "http://localhost:3000";
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const demoImage = (name) => path.join(root, "public", "demo", name);

const results = [];
let page;

async function step(name, fn) {
  try {
    await fn();
    results.push(`PASS ${name}`);
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push(`FAIL ${name}: ${error.message.split("\n")[0]}`);
    console.log(`FAIL ${name}: ${error.message.split("\n")[0]}`);
    if (page) {
      await page
        .screenshot({ path: `e2e-fail-${name.replace(/\W+/g, "-")}.png`, fullPage: true })
        .catch(() => {});
    }
    throw error;
  }
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 850 } });
page = await context.newPage();
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

const TEST_CAT = "دسته آزمایشی";
const TEST_PROJECT = "پروژه آزمایشی کمد";
const RENAMED_PROJECT = "پروژه آزمایشی ویرایش‌شده";

try {
  await step("login page renders", async () => {
    // networkidle here: the submit handler needs hydration before we click
    await page.goto(`${base}/admin/login`, { waitUntil: "networkidle" });
    await page.waitForSelector("input[type=password]", { timeout: 10000 });
    await page.waitForTimeout(600);
  });

  await step("login with password", async () => {
    await page.fill("input[type=password]", process.env.ADMIN_PASSWORD || "admin");
    await page.click("button[type=submit]");
    await page.waitForURL("**/admin", { timeout: 15000 });
  });

  await step("create category with cover image", async () => {
    await page.goto(`${base}/admin/categories`, { waitUntil: "domcontentloaded" });
    await page.click("text=دسته جدید");
    await page.fill('input[placeholder*="کابینت آشپزخانه"]', TEST_CAT);
    const chooser = page.waitForEvent("filechooser");
    await page.click("text=عکس را انتخاب کنید");
    await (await chooser).setFiles(demoImage("entry-storage.webp"));
    // wait for upload preview to appear (spinner gone, thumbnail present)
    await page.waitForSelector("text=در حال بارگذاری", { state: "hidden", timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(1500);
    await page.click("text=ثبت دسته");
    await page.waitForSelector(`text=${TEST_CAT}`, { timeout: 15000 });
  });

  await step("create project with two images", async () => {
    // networkidle + settle: typing before hydration would be wiped by React
    await page.goto(`${base}/admin/projects/new`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    // category chip selector
    await page.click(`form button:has-text("${TEST_CAT}")`);
    await page.waitForSelector(
      `form button[aria-pressed="true"]:has-text("${TEST_CAT}")`,
      { timeout: 5000 },
    );
    // optional fields live behind the collapsible details
    await page.click("text=توضیحات بیشتر");
    await page.fill('input[placeholder="تهران"]', "قم");
    await page.fill('input[placeholder="۱۴۰۵"]', "1404");
    await page.fill('input[placeholder*="روکش گردو"]', "ام‌دی‌اف، بلوط");
    await page.fill('input[placeholder*="جزیره گردویی"]', "خلاصه آزمایشی کار");
    const chooser = page.waitForEvent("filechooser");
    await page.click("text=عکس‌ها را انتخاب کنید");
    await (await chooser).setFiles([
      demoImage("wardrobe-smoked-oak.webp"),
      demoImage("home-office-oak.webp"),
    ]);
    await page.waitForSelector("text=عکس اصلی", { timeout: 45000 });
    await page.waitForSelector("text=در حال بارگذاری", { state: "hidden", timeout: 45000 }).catch(() => {});
    await page.waitForTimeout(500); // let the layout settle after thumbnails
    await page.fill('input[placeholder*="آشپزخانه سفید"]', TEST_PROJECT);
    // show on home page toggle — assert it actually switched on
    await page.click('button[role="switch"]');
    await page.waitForSelector('button[role="switch"][aria-checked="true"]', {
      timeout: 5000,
    });
    await page.click("text=ذخیره کار");
    await page.waitForURL("**/admin/projects", { timeout: 20000, waitUntil: "commit" });
    await page.waitForSelector(`text=${TEST_PROJECT}`, { timeout: 15000 });
  });

  await step("project appears on public works page", async () => {
    await page.goto(`${base}/works`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(`text=${TEST_PROJECT}`, { timeout: 15000 });
  });

  await step("public project detail page renders gallery", async () => {
    await page.click(`text=${TEST_PROJECT}`);
    await page.waitForSelector("text=درباره این پروژه", { timeout: 15000 }).catch(() => {});
    const imgs = await page.locator("main img").count();
    if (imgs < 2) throw new Error(`expected >=2 images, got ${imgs}`);
  });

  await step("category filter shows the project", async () => {
    await page.goto(`${base}/works`, { waitUntil: "domcontentloaded" });
    await page.click(`button:has-text("${TEST_CAT}")`);
    await page.waitForSelector(`text=${TEST_PROJECT}`, { timeout: 10000 });
  });

  await step("edit project title", async () => {
    await page.goto(`${base}/admin/projects`, { waitUntil: "domcontentloaded" });
    await page.click(`[aria-label="ویرایش ${TEST_PROJECT}"]`);
    await page.waitForSelector('input[placeholder*="آشپزخانه سفید"]', { timeout: 15000 });
    await page.fill('input[placeholder*="آشپزخانه سفید"]', RENAMED_PROJECT);
    await page.click("text=ذخیره تغییرات");
    await page.waitForURL("**/admin/projects", { timeout: 20000, waitUntil: "commit" });
    await page.waitForSelector(`text=${RENAMED_PROJECT}`, { timeout: 15000 });
  });

  await step("settings save roundtrip", async () => {
    await page.goto(`${base}/admin/settings`, { waitUntil: "domcontentloaded" });
    await page.fill('input[placeholder="15"]', "18");
    await page.click("text=ذخیره همه تنظیمات");
    await page.waitForSelector("text=ذخیره شد و روی سایت رفت", { timeout: 15000 });
  });

  await step("delete test project", async () => {
    await page.goto(`${base}/admin/projects`, { waitUntil: "domcontentloaded" });
    await page.click(`[aria-label="حذف ${RENAMED_PROJECT}"]`);
    await page.click("text=بله، حذف کن");
    await page.waitForSelector(`text=${RENAMED_PROJECT}`, { state: "hidden", timeout: 15000 });
  });

  await step("delete test category", async () => {
    await page.goto(`${base}/admin/categories`, { waitUntil: "domcontentloaded" });
    await page.click(`[aria-label="حذف ${TEST_CAT}"]`);
    await page.click("text=بله، حذف کن");
    await page.waitForSelector(`text=${TEST_CAT}`, { state: "hidden", timeout: 15000 });
  });

  await step("logout", async () => {
    await page.click("text=خروج");
    await page.waitForURL("**/admin/login", { timeout: 15000 });
  });

  console.log("\nALL STEPS PASSED");
} catch {
  console.log("\nE2E STOPPED AT FIRST FAILURE");
} finally {
  await browser.close();
  console.log("\n=== summary ===");
  for (const r of results) console.log(r);
}
