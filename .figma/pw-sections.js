const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require("playwright");

const url = process.env.TARGET_URL || "http://localhost:3021/";
const outDir = path.resolve(".figma/screens/sections");
fs.mkdirSync(outDir, { recursive: true });

const targets = [
  { name: "01-hero", sel: "#top" },
  { name: "02-beforeafter", sel: "section:nth-of-type(2)" },
  { name: "03-trustbar", sel: "section:nth-of-type(3)" },
  { name: "04-audience", sel: "#audience" },
  { name: "05-how", sel: "section.section-dark:nth-of-type(1)", byText: "How it works" },
  { name: "06-scope", sel: "#scope" },
  { name: "07-money", sel: "section", byText: "We would rather show you" },
  { name: "08-plans", sel: "#pricing" },
  { name: "09-ladder", sel: "section", byText: "Upgrade ladder" },
  { name: "10-proof", sel: "section", byText: "Delivered work you can check" },
  { name: "11-fit", sel: "section", byText: "This works best" },
  { name: "12-faq", sel: "#faq" },
  { name: "13-apply", sel: "#apply" },
  { name: "14-cta", sel: "#cta" },
  { name: "15-footer", sel: "footer" },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);

    for (const t of targets) {
      let handle;
      if (t.byText) {
        handle = await page
          .locator("section")
          .filter({ hasText: t.byText })
          .first()
          .elementHandle();
      } else {
        handle = await page.$(t.sel);
      }
      if (!handle) {
        console.log(`SKIP ${t.name}: not found`);
        continue;
      }
      const out = path.join(outDir, `${t.name}.png`);
      await handle.scrollIntoViewIfNeeded();
      await page.waitForTimeout(80);
      await handle.screenshot({ path: out });
      const box = await handle.boundingBox();
      console.log(`${t.name}: ${out} ${box?.width}x${box?.height}`);
    }
    await ctx.close();
  } finally {
    await browser.close();
  }
})();
