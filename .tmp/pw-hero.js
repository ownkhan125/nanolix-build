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

    // Screenshot 1: just the hero section (#top)
    const hero = page.locator('#top').first();
    await hero.waitFor({ state: 'visible', timeout: 20000 });
    await hero.evaluate((el) => {
      const y = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: y, behavior: 'instant' });
    });
    await page.waitForTimeout(300);
    await hero.screenshot({ path: path.join(artifactDir, 'current-hero.png') });
    console.log('Saved current-hero.png');

    // Screenshot 2: top ~1400px of the page
    await page.setViewportSize({ width: 1440, height: 1400 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(artifactDir, 'current-top.png'), clip: { x: 0, y: 0, width: 1440, height: 1400 } });
    console.log('Saved current-top.png');
  } finally {
    await browser.close();
  }
})();
