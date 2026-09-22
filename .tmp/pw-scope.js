const path = require('node:path');
const { chromium } = require('playwright');

const artifactDir = 'C:\\Users\\General\\Documents\\GitHub\\Nanolix Build Landing Page\\.tmp';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const vp of [
      { name: 'desktop', width: 1440, height: 900 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 390, height: 844 },
    ]) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await ctx.newPage();
      const errs = [];
      page.on('pageerror', (e) => errs.push(String(e)));
      page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });

      await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      // Locate ScopeSheet by id
      const scope = page.locator('#scope');
      await scope.waitFor();
      const docTop = await scope.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);

      // ── Layout-shift measurement ──
      // Measure heights BEFORE scrolling to it, then AFTER animation completes.
      const measureBefore = await scope.evaluate((el) => {
        return {
          sectionH: Math.round(el.getBoundingClientRect().height),
          boxH: Math.round(el.querySelector('.scope-grid')?.parentElement?.getBoundingClientRect().height || 0),
          includedH: Math.round(el.querySelector('.scope-col-included')?.getBoundingClientRect().height || 0),
          upgradesH: Math.round(el.querySelector('.scope-col-upgrades')?.getBoundingClientRect().height || 0),
          firstItemY: (() => {
            const li = el.querySelector('.scope-col-included li');
            return li ? Math.round(li.getBoundingClientRect().top - el.getBoundingClientRect().top) : 0;
          })(),
        };
      });

      // Position section top just below fold, then slow-scroll into it capturing frames.
      const startScroll = Math.max(0, docTop - vp.height * 1.05);
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), startScroll);
      await page.waitForTimeout(500);

      // Slow scroll to reveal section entirely
      const endScroll = startScroll + Math.min(700, vp.height);
      const steps = 10;
      for (let i = 0; i <= steps; i++) {
        const y = startScroll + Math.round((endScroll - startScroll) * (i / steps));
        await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y);
        await page.waitForTimeout(150);
        await page.screenshot({ path: path.join(artifactDir, `scope-${vp.name}-f${String(i).padStart(2,'0')}.png`) });
      }

      // After all animations settle
      await page.waitForTimeout(1500);
      const measureAfter = await scope.evaluate((el) => {
        return {
          sectionH: Math.round(el.getBoundingClientRect().height),
          boxH: Math.round(el.querySelector('.scope-grid')?.parentElement?.getBoundingClientRect().height || 0),
          includedH: Math.round(el.querySelector('.scope-col-included')?.getBoundingClientRect().height || 0),
          upgradesH: Math.round(el.querySelector('.scope-col-upgrades')?.getBoundingClientRect().height || 0),
          firstItemY: (() => {
            const li = el.querySelector('.scope-col-included li');
            return li ? Math.round(li.getBoundingClientRect().top - el.getBoundingClientRect().top) : 0;
          })(),
        };
      });

      // Check reverse — scroll back to top
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(1500);
      const reverseState = await scope.evaluate((el) => {
        const h3 = el.querySelector('.scope-col-included > h3');
        const firstLi = el.querySelector('.scope-col-included li');
        const footer = el.querySelector('[data-scope-footer]');
        return {
          h3Opacity: h3 ? getComputedStyle(h3).opacity : null,
          firstLiOpacity: firstLi ? getComputedStyle(firstLi).opacity : null,
          footerOpacity: footer ? getComputedStyle(footer).opacity : null,
        };
      });

      console.log(`--- ${vp.name} ${vp.width}x${vp.height} ---`);
      console.log('before:', measureBefore);
      console.log('after :', measureAfter);
      console.log('reverse (all should be near 0):', reverseState);
      console.log('errors:', errs.length ? errs.slice(0, 3) : 'none');
      await ctx.close();
    }
  } finally {
    await browser.close();
  }
})();
