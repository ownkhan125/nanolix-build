const path = require("node:path");
const { chromium } = require("playwright");

const url = process.env.TARGET_URL || "http://localhost:3001/";

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: "networkidle" });
    // Move divider to right so AFTER pane is fully visible
    await page.evaluate(() => {
      const wrap = document.querySelector(".ba-stage");
      if (!wrap) return;
      wrap.scrollIntoView({ block: "center" });
    });
    await page.waitForTimeout(500);
    // Force the AFTER pane fully visible by disabling the clipPath so we can inspect the mock nav
    await page.evaluate(() => {
      const after = document.querySelector(".ba-after");
      if (after) { after.style.clipPath = "none"; after.style.webkitClipPath = "none"; }
      const before = document.querySelector(".ba-before");
      if (before) { before.style.clipPath = "inset(0 100% 0 0)"; before.style.webkitClipPath = "inset(0 100% 0 0)"; }
    });
    await page.waitForTimeout(300);
    // Screenshot the frame region
    const frame = await page.$(".ba-frame");
    if (frame) {
      await frame.screenshot({ path: path.resolve(".figma/screens/ba-after-desktop.png") });
      console.log("Wrote ba-after-desktop.png");
    }

    // Check that no element with text "AFTER" exists inside ba-after
    const hasAfterBadge = await page.evaluate(() => {
      const layers = document.querySelectorAll(".ba-after");
      for (const layer of layers) {
        for (const el of layer.querySelectorAll("div, span")) {
          if (el.textContent.trim() === "AFTER") return true;
        }
      }
      return false;
    });
    console.log(`AFTER badge present: ${hasAfterBadge ? "STILL PRESENT" : "removed ✓"}`);
    await ctx.close();
  } finally {
    await browser.close();
  }
})();
