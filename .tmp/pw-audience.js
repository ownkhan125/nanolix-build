const { chromium } = require('playwright');

const targetUrl = 'http://localhost:3001';
const outPath = 'C:\\Users\\General\\Documents\\GitHub\\Nanolix Build Landing Page\\.tmp\\current-audience.png';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const heading = page.locator('h2', { hasText: 'Pick the closest fit' }).first();
    await heading.waitFor({ state: 'visible', timeout: 20000 });
    // Get bounding box of heading + paragraph together
    const rect = await heading.evaluate((el) => {
      const p = el.nextElementSibling;
      const h = el.getBoundingClientRect();
      const pr = p.getBoundingClientRect();
      return { x: h.x - 20, y: h.y - 10, w: Math.max(h.right, pr.right) - h.x + 40, h: pr.bottom - h.y + 20 };
    });
    await heading.evaluate((el) => {
      const y = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: 'instant' });
    });
    await page.waitForTimeout(500);
    const rect2 = await heading.evaluate((el) => {
      const p = el.nextElementSibling;
      const h = el.getBoundingClientRect();
      const pr = p.getBoundingClientRect();
      return { x: Math.max(0, h.x - 20), y: Math.max(0, h.y - 20), width: Math.max(h.right, pr.right) - h.x + 40, height: pr.bottom - h.y + 40 };
    });
    await page.screenshot({ path: outPath, clip: { x: rect2.x, y: rect2.y, width: Math.min(rect2.width, 1440 - rect2.x), height: Math.min(rect2.height, 900 - rect2.y) } });
    console.log('Saved:', outPath);
  } finally {
    await browser.close();
  }
})();
