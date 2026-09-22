const { chromium } = require('playwright');

const targetUrl = 'http://localhost:3001';
const outPath = 'C:\\Users\\General\\Documents\\GitHub\\Nanolix Build Landing Page\\.tmp\\current-ladder.png';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const el = page.locator('p', { hasText: 'smaller piece of work' }).first();
    await el.waitFor({ state: 'visible', timeout: 20000 });
    await el.evaluate((e) => {
      const y = e.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: 'instant' });
    });
    await page.waitForTimeout(500);
    const rect = await el.evaluate((e) => {
      const r = e.getBoundingClientRect();
      return { x: Math.max(0, r.x - 40), y: Math.max(0, r.y - 20), width: r.width + 80, height: r.height + 40 };
    });
    const info = await el.evaluate((e) => {
      const s = getComputedStyle(e);
      return { fontFamily: s.fontFamily, fontSize: s.fontSize, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing, color: s.color, textAlign: s.textAlign, width: s.width };
    });
    console.log('style:', JSON.stringify(info));
    console.log('rect:', JSON.stringify(rect));
    await page.screenshot({ path: outPath, clip: { x: rect.x, y: rect.y, width: Math.min(rect.width, 1440 - rect.x), height: Math.min(rect.height, 900 - rect.y) } });
    console.log('Saved:', outPath);
  } finally {
    await browser.close();
  }
})();
