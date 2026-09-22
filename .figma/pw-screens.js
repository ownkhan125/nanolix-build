const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require("playwright");

const url = process.env.TARGET_URL || "http://localhost:3021/";
const outDir = process.env.PW_ARTIFACT_DIR || path.resolve(".figma/screens");
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "mobile-375", width: 375, height: 812 },
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
      await page.waitForTimeout(300);
      const out = path.join(outDir, `${v.name}.png`);
      await page.screenshot({ path: out, fullPage: true });
      const bodyH = await page.evaluate(() => document.body.scrollHeight);
      console.log(`${v.name}: saved ${out} bodyH=${bodyH} errors=${errors.length}`);
      if (errors.length) errors.forEach((e) => console.log("  ERR:", e));
      await ctx.close();
    }
  } finally {
    await browser.close();
  }
})();
