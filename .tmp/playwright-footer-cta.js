const path = require('node:path');
const { chromium } = require('playwright');

const targetUrl = process.env.TARGET_URL || 'http://localhost:3001';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    // Screenshot the CTA section
    const cta = page.locator('#cta');
    await cta.waitFor();
    await cta.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const ctaBox = await cta.boundingBox();
    console.log('CTA bounding box:', JSON.stringify(ctaBox));
    await page.screenshot({
      path: path.resolve(process.cwd(), '.tmp/cta-verify.png'),
      clip: ctaBox ? { x: 0, y: ctaBox.y, width: 1440, height: ctaBox.height } : undefined,
    });

    // Screenshot the Footer
    const footer = page.locator('footer');
    await footer.waitFor();
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const footerBox = await footer.boundingBox();
    console.log('Footer bounding box:', JSON.stringify(footerBox));
    await page.screenshot({
      path: path.resolve(process.cwd(), '.tmp/footer-verify.png'),
      clip: footerBox ? { x: 0, y: footerBox.y, width: 1440, height: footerBox.height } : undefined,
    });
  } finally {
    await browser.close();
  }
})();
