const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({ headless: true });
  try {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    page.on('console', (m) => console.log('[c]', m.type(), m.text()));
    await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    const target = page.locator('h2[data-reveal-heading]').filter({ hasText: /We would rather show/ }).first();
    await target.waitFor();

    // Get initial doc position of heading
    const docTop = await target.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    console.log('heading doc top:', docTop);

    // Scroll so heading top is at viewport 40% (well into "past start")
    await page.evaluate((t) => window.scrollTo({ top: t - window.innerHeight * 0.4, behavior: 'instant' }), docTop);
    await page.waitForTimeout(1500);
    let state = await target.evaluate((el) => {
      const inner = el.querySelector('.mr-inner');
      return { t: inner?.textContent, tr: getComputedStyle(inner).transform };
    });
    console.log('after scroll to 40% (should be revealed=matrix 0,0):', JSON.stringify(state));

    // Now scroll far UP so heading is BELOW viewport bottom (out of view)
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(1500);
    state = await target.evaluate((el) => {
      const inner = el.querySelector('.mr-inner');
      const rect = el.getBoundingClientRect();
      return { t: inner?.textContent, tr: getComputedStyle(inner).transform, rect: {top: rect.top, bottom: rect.bottom} };
    });
    console.log('after scroll to 0 (heading below fold, should be hidden=translate ~80px):', JSON.stringify(state));

    // Get trigger diagnostics
    const stats = await page.evaluate(() => {
      const st = window.ScrollTrigger || (window.gsap && window.gsap.ScrollTrigger);
      if (!window.__mrDebug) return null;
      const t = window.__mrDebug.triggers.find(({ st }) => st.trigger?.textContent?.includes('would rather'));
      return t ? {
        stActive: t.st.isActive, stStart: t.st.start, stEnd: t.st.end, stScroll: t.st.scroll(),
        stProgress: t.st.progress, stDir: t.st.direction, tlTime: t.tl.time(), tlProg: t.tl.progress(),
      } : null;
    });
    console.log('trigger stats:', JSON.stringify(stats, null, 2));
  } finally {
    await b.close();
  }
})();
