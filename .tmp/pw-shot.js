const path = require('node:path');
const { chromium } = require('playwright');

const targetUrl = 'http://localhost:3001';
const outPath = process.env.OUT_PATH || 'C:\\Users\\General\\Documents\\GitHub\\Nanolix Build Landing Page\\.tmp\\current-before-after.png';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const section = page.locator('h2', { hasText: 'See the' }).first().locator('xpath=ancestor::section[1]');
    await section.waitFor({ state: 'visible', timeout: 20000 });
    // Scroll so the section top sits at the top of viewport
    await section.evaluate((el) => {
      const y = el.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({ top: y, behavior: 'instant' });
    });
    await page.waitForTimeout(600);
    await section.screenshot({ path: outPath });
    console.log('Saved:', outPath);
  } finally {
    await browser.close();
  }
})();
