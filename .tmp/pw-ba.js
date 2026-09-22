const path = require('node:path');
const { chromium } = require('playwright');

const targetUrl = process.env.TARGET_URL || 'http://localhost:3001';
const artifactDir = 'C:\\Users\\General\\Documents\\GitHub\\Nanolix Build Landing Page\\.tmp';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const label = page.getByText('See the', { exact: false }).first();
    await label.waitFor({ state: 'visible', timeout: 20000 });
    const section = label.locator('xpath=ancestor::section[1]');
    await section.evaluate((el) => {
      const y = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: y, behavior: 'instant' });
    });
    await page.waitForTimeout(400);
    await section.screenshot({ path: path.join(artifactDir, 'current-ba.png') });
    console.log('Saved current-ba.png');

    // Also do a left-column crop and a bottom-caption crop for direct comparison
    const box = await section.boundingBox();
    if (box) {
      // Left column (heading area) — top-left ~500x400
      await page.screenshot({
        path: path.join(artifactDir, 'current-ba-left.png'),
        clip: { x: Math.max(0, box.x + 40), y: Math.max(0, box.y + 40), width: 560, height: 380 },
      });
      // Caption at bottom of section
      await page.screenshot({
        path: path.join(artifactDir, 'current-ba-caption.png'),
        clip: { x: Math.max(0, box.x + 100), y: Math.max(0, box.y + box.height - 220), width: Math.min(1240, box.width), height: 200 },
      });
      console.log('Saved crops');
    }
  } finally {
    await browser.close();
  }
})();
