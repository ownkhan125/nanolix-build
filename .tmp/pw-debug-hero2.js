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

    // Force ScrollTrigger + our globals to log
    const dump = await page.evaluate(() => {
      const g = window.gsap || null;
      const st = window.ScrollTrigger || (g && g.ScrollTrigger) || null;
      return {
        hasGsap: !!g,
        hasST: !!st,
        stAllCount: st ? st.getAll().length : null,
        stActiveCount: st ? st.getAll().filter(t => t.isActive).length : null,
        stStates: st ? st.getAll().slice(0, 4).map(t => ({
          triggerText: (t.trigger && t.trigger.textContent || '').slice(0, 40),
          progress: t.progress,
          isActive: t.isActive,
          scroll: t.scroll(),
          start: t.start,
          end: t.end,
        })) : null,
      };
    });
    console.log(JSON.stringify(dump, null, 2));
  } finally {
    await b.close();
  }
})();
