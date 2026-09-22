const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require("playwright");

const url = process.env.TARGET_URL || "http://localhost:3001/";
const outDir = path.resolve(".figma/screens/sections");
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: "ba-1440", width: 1440, height: 900 },
  { name: "ba-768", width: 768, height: 1024 },
  { name: "ba-375", width: 375, height: 812 },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const v of viewports) {
      const ctx = await browser.newContext({
        viewport: { width: v.width, height: v.height },
        deviceScaleFactor: 1,
      });
      const page = await ctx.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForTimeout(400);
      // BeforeAfter is the second section (no id). Find by heading text.
      const sec = await page.evaluateHandle(() => {
        const h2s = document.querySelectorAll("h2");
        for (const h of h2s) {
          if (h.textContent.includes("difference a clear")) {
            return h.closest("section");
          }
        }
        return null;
      });
      const el = sec.asElement();
      if (!el) {
        console.log(`${v.name}: BeforeAfter not found`);
        continue;
      }
      const out = path.join(outDir, `${v.name}.png`);
      await el.screenshot({ path: out });
      const box = await el.boundingBox();
      console.log(`${v.name}: ${out} ${box?.width}x${box?.height} errors=${errors.length}`);
      if (errors.length) errors.forEach((e) => console.log("  ERR:", e));
      await ctx.close();
    }
  } finally {
    await browser.close();
  }
})();
