import { chromium } from "@playwright/test";

const base = "http://localhost:3000";
const browser = await chromium.launch();
const out = [];
const ok = (n) => out.push(`PASS ${n}`);
const bad = (n, e) => out.push(`FAIL ${n}: ${e}`);

// ---- Mobile: menu + floating contact ----
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(base, { waitUntil: "networkidle" });

  try {
    await page.click('button[aria-label="باز کردن منو"]');
    await page.waitForSelector('nav[aria-label="منوی موبایل"]', { timeout: 4000 });
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    if (bodyOverflow !== "hidden") throw new Error("body scroll not locked");
    await page.click('nav[aria-label="منوی موبایل"] >> text=نمونه‌کارها');
    await page.waitForURL("**/works", { timeout: 8000 });
    const menuGone = await page.locator('nav[aria-label="منوی موبایل"]').count();
    if (menuGone > 0) throw new Error("menu did not close after navigation");
    ok("mobile menu open/navigate/close");
  } catch (e) {
    bad("mobile menu", e.message.split("\n")[0]);
  }

  try {
    await page.goto(base, { waitUntil: "networkidle" });
    const bar = page.locator('[data-testid="floating-contact"]');
    const hiddenAtTop = await bar.evaluate((el) => getComputedStyle(el).opacity === "0");
    await page.evaluate(() => window.scrollTo(0, 900));
    await page.waitForTimeout(500);
    const visibleAfterScroll = await bar.evaluate(
      (el) => getComputedStyle(el).opacity === "1",
    );
    const links = await bar.locator("a").evaluateAll((els) =>
      els.map((a) => a.getAttribute("href") ?? ""),
    );
    const hasTel = links.some((h) => h.startsWith("tel:+98"));
    const hasWa = links.some((h) => h.startsWith("https://wa.me/98") && h.includes("text="));
    if (!hiddenAtTop || !visibleAfterScroll || !hasTel || !hasWa) {
      throw new Error(
        `hidden=${hiddenAtTop} visible=${visibleAfterScroll} tel=${hasTel} wa=${hasWa}`,
      );
    }
    ok("floating contact bar (tel + prefilled whatsapp)");
  } catch (e) {
    bad("floating contact bar", e.message.split("\n")[0]);
  }
  await page.close();
}

// ---- Desktop: lightbox + filter URL sync + back/forward ----
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 850 } });

  try {
    await page.goto(
      `${base}/works/${encodeURIComponent("آشپزخانه-مدرن-با-جزیره-چوبی")}`,
      { waitUntil: "networkidle" },
    );
    await page.waitForTimeout(800); // allow hydration to attach the lightbox
    await page.click("a.gallery-link");
    await page.waitForSelector(".pswp--open", { timeout: 8000 });
    await page.waitForTimeout(900); // keyboard binds after the opening animation
    await page.keyboard.press("Escape");
    await page.waitForSelector(".pswp--open", { state: "hidden", timeout: 4000 });
    ok("photoswipe lightbox opens and closes");
  } catch (e) {
    bad("lightbox", e.message.split("\n")[0]);
  }

  try {
    await page.goto(`${base}/works`, { waitUntil: "networkidle" });
    await page.click('button:has-text("کافی‌بار خانگی")');
    await page.waitForTimeout(400);
    const url = page.url();
    if (!decodeURIComponent(url).includes("cat=کافی-بار-خانگی"))
      throw new Error(`url=${url}`);
    const cards = await page.locator("main a.group h3").count();
    if (cards !== 3) throw new Error(`expected 3 cards, got ${cards}`);
    ok("filter chip updates URL and grid");

    // Direct deep link with the category filter (wait out hydration)
    await page.goto(`${base}/works?cat=${encodeURIComponent("کمد-دیواری")}`, {
      waitUntil: "networkidle",
    });
    await page.waitForSelector('button[aria-pressed="true"]:has-text("کمد دیواری")', {
      timeout: 8000,
    });
    ok("filter deep link selects chip");
  } catch (e) {
    bad("works filter", e.message.split("\n")[0]);
  }

  // Keyboard: tab to skip around, ensure focus visible on nav links
  try {
    await page.goto(base, { waitUntil: "networkidle" });
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    if (!focused || focused === "BODY") throw new Error("focus not moving");
    ok("keyboard focus traversal works");
  } catch (e) {
    bad("keyboard focus", e.message.split("\n")[0]);
  }

  await page.close();
}

await browser.close();
console.log(out.join("\n"));
