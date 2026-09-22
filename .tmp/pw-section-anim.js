const path = require('node:path');
const { chromium } = require('playwright');

const artifactDir = 'C:\\Users\\General\\Documents\\GitHub\\Nanolix Build Landing Page\\.tmp';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    // For each below-fold section, position so its top is just at 90% viewport height
    // (just about to enter the reveal trigger), then snap frames rapidly.
    const sectionsInfo = await page.$$eval('main > section', (els) => els.map((e, i) => ({
      index: i,
      id: e.id || '',
      docTop: e.getBoundingClientRect().top + window.scrollY,
      firstText: (e.querySelector('h1, h2, .eyebrow')?.textContent || '').trim().slice(0, 30),
    })));
    console.log('sections:', sectionsInfo);

    // Pick 3 sections spread over the page
    const targets = [sectionsInfo[3], sectionsInfo[6], sectionsInfo[10]].filter(Boolean);
    for (const s of targets) {
      // Scroll so section top hits viewport 90% (just below trigger start of 82%)
      await page.evaluate(({ docTop }) => {
        window.scrollTo({ top: Math.max(0, docTop - window.innerHeight * 0.92), behavior: 'instant' });
      }, s);
      await page.waitForTimeout(300);
      // Now scroll a tiny bit more so section top is at 82% → onEnter fires
      await page.evaluate(() => window.scrollBy({ top: 80, behavior: 'instant' }));
      // Rapid frames
      for (let i = 0; i < 6; i++) {
        await page.waitForTimeout(180);
        await page.screenshot({
          path: path.join(artifactDir, `sec-${s.index}-${s.firstText.replace(/[^a-zA-Z]/g,'_').slice(0,20)}-frame-${i}.png`),
          fullPage: false,
        });
      }
    }

    if (errs.length) console.log('errors:', errs.slice(0, 3));
    else console.log('no errors');
  } finally {
    await browser.close();
  }
})();
