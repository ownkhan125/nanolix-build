const path = require('node:path');
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({ headless: true });
  try {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const p = await ctx.newPage();
    await p.goto('http://localhost:3001', { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(1000);
    const h1 = p.locator('h1.hero-h1').first();
    await h1.waitFor();
    const box = await h1.boundingBox();
    await p.screenshot({
      path: 'C:/Users/General/Documents/GitHub/Nanolix Build Landing Page/.tmp/hero-wrap-1440.png',
      clip: { x: box.x - 20, y: box.y - 20, width: box.width + 40, height: box.height + 40 },
    });
    console.log('Saved hero-wrap-1440.png');
  } finally {
    await b.close();
  }
})();
