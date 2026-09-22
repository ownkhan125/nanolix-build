const path = require('node:path');
const { chromium } = require('playwright');

const targetUrl = process.env.TARGET_URL || 'http://localhost:3001';
const outPath = path.resolve(process.cwd(), '.tmp/care-plans-verify.png');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    const section = page.locator('#pricing');
    await section.waitFor();
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
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
