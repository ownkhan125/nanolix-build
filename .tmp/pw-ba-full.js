const { chromium } = require('playwright');

const targetUrl = 'http://localhost:3001';
const outPath = 'C:\\Users\\General\\Documents\\GitHub\\Nanolix Build Landing Page\\.tmp\\current-ba-full.png';
const outPath2 = 'C:\\Users\\General\\Documents\\GitHub\\Nanolix Build Landing Page\\.tmp\\current-ba-full-2.png';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const heading = page.locator('h2', { hasText: 'See the' }).first();
    await heading.waitFor({ state: 'visible', timeout: 20000 });
    await heading.evaluate((el) => {
      const y = el.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top: y, behavior: 'instant' });
    });
    await page.waitForTimeout(300);

    // Get frame bounds
    const frame = page.locator('.ba-frame').first();
    const box = await frame.boundingBox();
    console.log('frame:', JSON.stringify(box));
    await page.screenshot({ path: outPath, clip: { x: Math.max(0, box.x - 10), y: Math.max(0, box.y - 10), width: Math.min(1440 - box.x + 10, box.width + 20), height: Math.min(900 - box.y + 10, box.height + 20) } });
    console.log('Saved:', outPath);

    // Move slider to 0% (all AFTER visible) via mouse drag
    const wrapRect = await frame.evaluate((el) => {
      const w = el.querySelector('[style*="height: 460px"]') || el.querySelector('div[style*="userSelect"]') || el.children[1];
      const r = w.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    });
    const btn = page.locator('button[aria-label="Drag to compare"]').first();
    const bb = await btn.boundingBox();
    await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
    await page.mouse.down();
    await page.mouse.move(wrapRect.x + 6, wrapRect.y + wrapRect.h / 2, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(400);
    await page.screenshot({ path: outPath2, clip: { x: Math.max(0, box.x - 10), y: Math.max(0, box.y - 10), width: Math.min(1440 - box.x + 10, box.width + 20), height: Math.min(900 - box.y + 10, box.height + 20) } });
    console.log('Saved:', outPath2);
  } finally {
    await browser.close();
  }
})();
