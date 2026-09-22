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

    // Find the section containing "Our delivered work:"
    const label = page.getByText('Our delivered work:', { exact: false }).first();
    await label.waitFor({ state: 'visible', timeout: 20000 });
    const section = label.locator('xpath=ancestor::section[1]');
    await section.evaluate((el) => {
      const y = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: y, behavior: 'instant' });
    });
    await page.waitForTimeout(400);
    await section.screenshot({ path: path.join(artifactDir, 'current-trust.png') });
    console.log('Saved current-trust.png');
  } finally {
    await browser.close();
  }
})();
