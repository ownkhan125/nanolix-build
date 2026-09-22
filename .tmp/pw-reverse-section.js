const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({ headless: true });
  try {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    // Pick WhereTheMoney section
    const info = await page.evaluate(() => {
      const sections = document.querySelectorAll('main > section');
      let target = null;
      for (const s of sections) {
        if (s.querySelector('.eyebrow')?.textContent?.includes('Where the money goes')) {
          target = s; break;
        }
      }
      if (!target) return { err: 'not found' };
      return { docTop: target.getBoundingClientRect().top + window.scrollY };
    });
    console.log('target section top:', info);

    // Scroll into view — section top at 30% viewport (well inside trigger)
    await page.evaluate((y) => window.scrollTo({ top: y - 900*0.3, behavior: 'instant' }), info.docTop);
    await page.waitForTimeout(1500);

    // Query state
    let s = await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('main > section'));
      const target = sections.find(s => s.querySelector('.eyebrow')?.textContent?.includes('Where the money goes'));
      if (!target) return null;
      const border = target.querySelector('.sr-border');
      const firstChild = target.querySelector('.content')?.children[0];
      return {
        borderTransform: border ? getComputedStyle(border).transform : null,
        borderOpacity: border ? getComputedStyle(border).opacity : null,
        firstChildOpacity: firstChild ? getComputedStyle(firstChild).opacity : null,
      };
    });
    console.log('After scroll into view (should be revealed):', s);

    // Scroll BACK to top
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(1500);
    s = await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('main > section'));
      const target = sections.find(s => s.querySelector('.eyebrow')?.textContent?.includes('Where the money goes'));
      const border = target.querySelector('.sr-border');
      const firstChild = target.querySelector('.content')?.children[0];
      return {
        borderTransform: border ? getComputedStyle(border).transform : null,
        borderOpacity: border ? getComputedStyle(border).opacity : null,
        firstChildOpacity: firstChild ? getComputedStyle(firstChild).opacity : null,
      };
    });
    console.log('After scroll back to top (should be hidden):', s);
  } finally {
    await b.close();
  }
})();
