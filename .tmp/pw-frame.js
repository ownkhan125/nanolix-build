const { chromium } = require('playwright');

const targetUrl = 'http://localhost:3001';
const outPath = 'C:\\Users\\General\\Documents\\GitHub\\Nanolix Build Landing Page\\.tmp\\current-frame.png';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const frame = page.locator('.ba-frame').first();
    await frame.waitFor({ state: 'visible', timeout: 20000 });
    await frame.evaluate((el) => {
      const y = el.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({ top: y, behavior: 'instant' });
    });
    await page.waitForTimeout(600);
    await frame.screenshot({ path: outPath });
    console.log('Saved:', outPath);
  } finally {
    await browser.close();
  }
})();
