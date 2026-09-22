const path = require('node:path');
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({ headless: true });
  try {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on('console', (m) => console.log('[console]', m.type(), m.text()));
    page.on('pageerror', (e) => console.log('[pageerror]', String(e)));

    await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const info = await page.evaluate(() => {
      const h1 = document.querySelector('h1[data-reveal-heading]');
      if (!h1) return { error: 'no h1' };
      const inners = Array.from(h1.querySelectorAll('.mr-inner'));
      const rect = h1.getBoundingClientRect();
      return {
        h1Present: true,
        h1DataApplied: h1.dataset.revealApplied,
        rect: { top: rect.top, bottom: rect.bottom, height: rect.height },
        innersCount: inners.length,
        innersTransforms: inners.slice(0, 4).map(el => ({
          text: el.textContent,
          transform: getComputedStyle(el).transform,
          top: el.getBoundingClientRect().top,
        })),
        hasScrollTrigger: !!(window.ScrollTrigger || (window.gsap && window.gsap.ScrollTrigger)),
      };
    });
    console.log(JSON.stringify(info, null, 2));

    await page.screenshot({ path: 'C:/Users/General/Documents/GitHub/Nanolix Build Landing Page/.tmp/debug-hero-y0.png', clip: { x: 0, y: 60, width: 1440, height: 500 } });
  } finally {
    await b.close();
  }
})();
