// Captures INTERACTION states (toasts, dialogs, open menus, lightbox, forms
// mid-use) that static page screenshots never show.
// Usage: node scripts/shoot-states.mjs <outDir> [baseUrl]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const outDir = process.argv[2] || "state-shots";
const base = process.argv[3] || "http://localhost:3000";
mkdirSync(outDir, { recursive: true });
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const demoImage = (n) => path.join(root, "public", "demo", n);

const browser = await chromium.launch();

async function snap(page, name) {
  await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: false });
  console.log(`ok ${name}`);
}

for (const [vp, viewport] of [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
]) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();

  // --- public: works filter active ---
  await page.goto(`${base}/works`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await page.click('button:has-text("کمد دیواری")');
  await page.waitForTimeout(600);
  await snap(page, `works-filtered-${vp}`);

  // --- public: lightbox open ---
  await page.goto(
    `${base}/works/${encodeURIComponent("کافی-بار-نئوکلاسیک-کرم")}`,
    { waitUntil: "networkidle" },
  );
  await page.waitForTimeout(800);
  await page.click("a.gallery-link");
  await page.waitForSelector(".pswp--open", { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(900);
  await snap(page, `lightbox-${vp}`);
  await page.keyboard.press("Escape");

  // --- public mobile: menu open ---
  if (vp === "mobile") {
    await page.goto(base, { waitUntil: "networkidle" });
    await page.click('button[aria-label="باز کردن منو"]');
    await page.waitForTimeout(500);
    await snap(page, `mobile-menu-open`);
  }

  // --- admin: login error ---
  await page.goto(`${base}/admin/login`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await page.fill("input[type=password]", "wrong-password");
  await page.click("button[type=submit]");
  await page.waitForTimeout(1200);
  await snap(page, `login-error-${vp}`);

  // login for the rest
  await page.request.post(`${base}/api/admin/login`, { data: { password: "admin" } });

  // --- admin: settings saved toast (should NOT overlap buttons) ---
  await page.goto(`${base}/admin/settings`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await page.fill('input[placeholder="15"]', "16");
  await page.click("text=ذخیره همه تنظیمات");
  await page
    .waitForSelector("text=ذخیره شد و روی سایت رفت", { timeout: 10000 })
    .catch(() => {});
  await page.waitForTimeout(400);
  await snap(page, `settings-saved-toast-${vp}`);

  // --- admin: project form mid-use (details open, images, new-category input) ---
  await page.goto(`${base}/admin/projects/new`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await page.fill('input[placeholder*="آشپزخانه سفید"]', "نمونه برای بازبینی");
  const chooser = page.waitForEvent("filechooser");
  await page.click("text=عکس‌ها را انتخاب کنید");
  await (await chooser).setFiles([demoImage("kitchen-modern.webp")]);
  await page.waitForSelector("text=عکس اصلی", { timeout: 30000 }).catch(() => {});
  await page.click("text=توضیحات بیشتر");
  await page.click("text=دسته جدید");
  await page.waitForTimeout(500);
  await snap(page, `project-form-miduse-${vp}`);

  // --- admin: delete dialog open ---
  await page.goto(`${base}/admin/projects`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  const del = page.locator('button[title="حذف"], button[aria-label^="حذف"]').first();
  await del.click();
  await page.waitForTimeout(500);
  await snap(page, `delete-dialog-${vp}`);
  await page.click("text=انصراف").catch(() => {});

  // --- admin: category editor open ---
  await page.goto(`${base}/admin/categories`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await page.click("text=دسته جدید");
  await page.waitForTimeout(400);
  await snap(page, `category-editor-${vp}`);

  await ctx.close();
}

await browser.close();
console.log("done");
