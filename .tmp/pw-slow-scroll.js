const path = require('node:path');
const { chromium } = require('playwright');

const artifactDir = 'C:\\Users\\General\\Documents\\GitHub\\Nanolix Build Landing Page\\.tmp';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    // Target the WhereTheMoney section
    const eyebrows = await page.$$eval('.eyebrow', els => els.map(el => ({
      text: el.textContent.trim(),
      docTop: el.getBoundingClientRect().top + window.scrollY,
    })));
    console.log('eyebrows:', eyebrows);

    // Pick "Where the money goes"
    const target = eyebrows.find(e => /money goes/i.test(e.text));
    if (!target) return console.log('target not found');
    console.log('target docTop:', target.docTop);

    // Scroll so the target is at 100vh (just below the fold, not yet in view)
    const startScroll = Math.max(0, target.docTop - 900); // 900 = viewport height
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), startScroll);
    await page.waitForTimeout(600); // let any prior reveals settle

    // Now scroll DOWN in small steps so the section enters trigger range
    const endScroll = startScroll + 400; // enough to enter reveal range
    const steps = 12;
    for (let i = 0; i <= steps; i++) {
      const y = startScroll + Math.round((endScroll - startScroll) * (i / steps));
      await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y);
      // capture full viewport
      await page.screenshot({ path: path.join(artifactDir, `slow-frame-${String(i).padStart(2,'0')}.png`) });
      await page.waitForTimeout(120);
    }
  } finally {
    await browser.close();
  }
})();
