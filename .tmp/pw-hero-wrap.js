const path = require('node:path');
const { chromium } = require('playwright');

const targetUrl = process.env.TARGET_URL || 'http://localhost:3001';
const artifactDir = 'C:\\Users\\General\\Documents\\GitHub\\Nanolix Build Landing Page\\.tmp';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    // Try a range of narrow widths to confirm no orphaned "you."
    const widths = [420, 500, 560, 620, 676, 720];
    for (const w of widths) {
      const context = await browser.newContext({ viewport: { width: w, height: 800 }, deviceScaleFactor: 1 });
      const page = await context.newPage();
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1200);
      const h1 = page.locator('h1.hero-h1').first();
      await h1.waitFor({ state: 'visible' });
      const box = await h1.boundingBox();
      await page.screenshot({
        path: path.join(artifactDir, `hero-wrap-${w}.png`),
        clip: { x: Math.max(0, box.x - 10), y: Math.max(0, box.y - 10), width: Math.min(w, box.width + 20), height: box.height + 20 },
      });
      console.log('width', w, 'h1 height', box.height);
      await context.close();
    }
  } finally {
    await browser.close();
  }
})();
