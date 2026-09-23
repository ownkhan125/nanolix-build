const path = require("node:path");
const { chromium } = require("playwright");

const url = process.env.TARGET_URL || "http://localhost:3001/";

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: "networkidle" });
    await page.evaluate(() => document.getElementById("apply")?.scrollIntoView({ block: "start" }));
    await page.waitForTimeout(500);

    // Advance through the 3 steps
    await page.fill('#apply input[type="text"]', "Acme Co");
    await page.fill('#apply input[type="email"]', "test@example.com");
    await page.fill('#apply textarea', "We make things.");
    await page.click('#apply button:has-text("Continue")');
    await page.waitForTimeout(300);
    const inputs2 = await page.$$('#apply input[type="text"]');
    if (inputs2[0]) await inputs2[0].fill("Karachi");
    if (inputs2[1]) await inputs2[1].fill("Founder");
    if (inputs2[2]) await inputs2[2].fill("Grow sales");
    if (inputs2[3]) await inputs2[3].fill("2 weeks");
    await page.click('#apply button:has-text("Submit my application")');
    await page.waitForTimeout(6500); // let Calendly iframe fully render

    // Measure container vs iframe heights
    const dims = await page.evaluate(() => {
      const container = document.querySelector(".apply-calendar-embed");
      const iframe = container?.querySelector("iframe");
      const containerBox = container?.getBoundingClientRect();
      const iframeBox = iframe?.getBoundingClientRect();
      return {
        container: containerBox ? { w: Math.round(containerBox.width), h: Math.round(containerBox.height) } : null,
        iframe: iframeBox ? { w: Math.round(iframeBox.width), h: Math.round(iframeBox.height) } : null,
      };
    });
    console.log("Container:", dims.container);
    console.log("Iframe:", dims.iframe);
    const fills = dims.iframe && dims.container && Math.abs(dims.iframe.h - dims.container.h) < 5;
    console.log(`iframe fills container: ${fills ? "OK ✓" : "FAIL — dead zone of " + (dims.container.h - dims.iframe.h) + "px"}`);

    // Screenshot the aside
    const aside = await page.$("#apply aside");
    if (aside) {
      const box = await aside.boundingBox();
      await page.screenshot({
        path: path.resolve(".figma/screens/apply-step3-aside.png"),
        clip: { x: box.x, y: box.y, width: box.width, height: Math.min(box.height, 900) },
      });
      console.log("Wrote apply-step3-aside.png");
    }

    await ctx.close();
  } finally {
    await browser.close();
  }
})();
