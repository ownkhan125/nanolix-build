const path = require("node:path");
const { chromium } = require("playwright");

const url = process.env.TARGET_URL || "http://localhost:3001/";

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const v of [
      { name: "desktop", width: 1440, height: 900 },
      { name: "mobile",  width: 390,  height: 844 },
    ]) {
      const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height } });
      const page = await ctx.newPage();
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);

      // Scroll to FAQ then open the 5th row to mirror the reference screenshot.
      await page.evaluate(() => document.getElementById("faq")?.scrollIntoView({ block: "start" }));
      await page.waitForTimeout(600);
      const rows = await page.$$('#faq button[aria-expanded]');
      if (rows[4]) await rows[4].click();
      await page.waitForTimeout(500);

      // Screenshot just the opened row to compare with the reference crop.
      const card = await page.evaluateHandle(() => {
        const btns = document.querySelectorAll('#faq button[aria-expanded="true"]');
        return btns[0]?.closest("div");
      });
      const el = card.asElement();
      if (el) {
        const box = await el.boundingBox();
        if (box) {
          await page.screenshot({
            path: path.resolve(`.figma/screens/faq-${v.name}.png`),
            clip: { x: box.x, y: box.y, width: box.width, height: box.height },
          });
          console.log(`[${v.name}] wrote faq-${v.name}.png (${Math.round(box.width)}×${Math.round(box.height)})`);
        }
      }
      await ctx.close();
    }
  } finally {
    await browser.close();
  }
})();
