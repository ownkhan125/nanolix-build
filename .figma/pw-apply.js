const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require("playwright");

const url = process.env.TARGET_URL || "http://localhost:3001/";
const outDir = path.resolve(".figma/screens/sections");
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: "apply-1440", width: 1440, height: 900 },
  { name: "apply-768", width: 768, height: 1024 },
  { name: "apply-375", width: 375, height: 812 },
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
      const sec = await page.$("#apply");
      if (!sec) {
        console.log(`${v.name}: #apply not found`);
        continue;
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
