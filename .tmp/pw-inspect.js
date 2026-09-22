const { chromium } = require('playwright');

const targetUrl = 'http://localhost:3001';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const info = await page.evaluate(() => {
      const h2 = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Pick the closest'));
      if (!h2) return null;
      const container = h2.parentElement;
      const p = h2.nextElementSibling;
      const cs = getComputedStyle(container);
      const hs = getComputedStyle(h2);
      const ps = getComputedStyle(p);
      return {
        container: { rect: container.getBoundingClientRect().toJSON(), maxWidth: cs.maxWidth, width: cs.width },
        heading: { rect: h2.getBoundingClientRect().toJSON(), fontFamily: hs.fontFamily, fontSize: hs.fontSize, fontWeight: hs.fontWeight, lineHeight: hs.lineHeight, letterSpacing: hs.letterSpacing },
        paragraph: { rect: p.getBoundingClientRect().toJSON(), fontFamily: ps.fontFamily, fontSize: ps.fontSize, lineHeight: ps.lineHeight, color: ps.color, textContent: p.textContent }
      };
    });
    console.log(JSON.stringify(info, null, 2));
  } finally {
    await browser.close();
  }
})();
