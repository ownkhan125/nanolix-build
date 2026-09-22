const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require("playwright");

const url = process.env.TARGET_URL || "http://localhost:3001/";
const outDir = path.resolve(".figma/screens/sections");
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: "how-1440", width: 1440, height: 900 },
  { name: "how-hover-1440", width: 1440, height: 900, hoverIndex: 2 },
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
      // Scroll to How It Works
      const secHandle = await page.evaluateHandle(() => {
        const h2s = document.querySelectorAll("h2");
        for (const h of h2s) {
          if (h.textContent.trim() === "How it works") return h.closest("section");
        }
        return null;
      });
      const sec = secHandle.asElement();
      if (!sec) { console.log(`${v.name}: not found`); continue; }
      await sec.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1200); // wait for reveals

      if (typeof v.hoverIndex === "number") {
        const item = await page.$(`.how-item:nth-child(${v.hoverIndex + 2})`); // +1 for spine span, +1 for nth-child index
        if (item) {
          await item.hover();
          await page.waitForTimeout(400);
        }
      }

      const out = path.join(outDir, `${v.name}.png`);
      await sec.screenshot({ path: out });
      const box = await sec.boundingBox();
      console.log(`${v.name}: ${out} ${box?.width}x${box?.height} errors=${errors.length}`);
      if (errors.length) errors.forEach((e) => console.log("  ERR:", e));
      await ctx.close();
    }
  } finally {
    await browser.close();
  }
})();
