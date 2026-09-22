const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({ headless: true });
  try {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on('console', (m) => console.log('[c]', m.type(), m.text()));
    page.on('pageerror', (e) => console.log('[e]', String(e)));

    await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3500);

    const info = await page.evaluate(() => {
      const d = window.__mrDebug;
      if (!d) return { err: 'no __mrDebug' };
      const heroT = d.triggers[0]; // first is hero H1
      return {
        triggersLen: d.triggers.length,
        heroTlState: {
          duration: heroT.tl.duration(),
          time: heroT.tl.time(),
          progress: heroT.tl.progress(),
          paused: heroT.tl.paused(),
          isActive: heroT.tl.isActive(),
        },
        heroStState: {
          isActive: heroT.st.isActive,
          start: heroT.st.start,
          end: heroT.st.end,
          scroll: heroT.st.scroll(),
          progress: heroT.st.progress,
          direction: heroT.st.direction,
        },
        firstInnerTransform: (() => {
          const el = heroT.st.trigger.querySelector('.mr-inner');
          return {
            text: el?.textContent,
            transform: el ? getComputedStyle(el).transform : null,
            inlineTransform: el?.style?.transform,
          };
        })(),
      };
    });
    console.log(JSON.stringify(info, null, 2));
  } finally {
    await b.close();
  }
})();
