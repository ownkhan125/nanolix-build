const path = require('node:path');
const { chromium } = require('playwright');

const targetUrl = process.env.TARGET_URL || 'http://localhost:3001';
const outPath = path.resolve(process.cwd(), '.tmp/money-cards-verify.png');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    // Find the eyebrow text for the section and scroll to it
    const eyebrow = page.getByText('Where the money goes', { exact: true });
    await eyebrow.waitFor({ state: 'visible' });
    await eyebrow.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // Locate section by finding the parent of the eyebrow
    const section = page.locator('section').filter({ hasText: 'Where the money goes' }).first();
    await section.waitFor();
    const box = await section.boundingBox();
    console.log('Section bounding box:', JSON.stringify(box));

    await page.screenshot({
      path: outPath,
      clip: box ? { x: 0, y: box.y, width: 1440, height: box.height } : undefined,
    });
    console.log('Saved:', outPath);
  } finally {
    await browser.close();
  }
})();
