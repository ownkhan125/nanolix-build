const path = require('node:path');
const { chromium } = require('playwright');

const artifactDir = 'C:\\Users\\General\\Documents\\GitHub\\Nanolix Build Landing Page\\.tmp';

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const vp of viewports) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

      await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2500);

      // Record heading heights, then scroll through page, then re-record.
      // If heights change, there's layout shift.
      const before = await page.$$eval('[data-reveal-heading]', els => els.map(e => ({
        text: (e.textContent||'').trim().slice(0,32),
        height: Math.round(e.getBoundingClientRect().height),
        width: Math.round(e.getBoundingClientRect().width),
      })));

      // Scroll to bottom then back to top so every heading fires
      const bodyH = await page.evaluate(() => document.body.scrollHeight);
      const steps = 20;
      for (let i = 1; i <= steps; i++) {
        await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(bodyH * i / steps));
        await page.waitForTimeout(80);
      }
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(500);

      const after = await page.$$eval('[data-reveal-heading]', els => els.map(e => ({
        text: (e.textContent||'').trim().slice(0,32),
        height: Math.round(e.getBoundingClientRect().height),
        width: Math.round(e.getBoundingClientRect().width),
      })));

      let shifts = 0;
      for (let i = 0; i < before.length; i++) {
        if (before[i].height !== after[i].height) shifts++;
      }
      console.log(`${vp.name}: ${before.length} headings, ${shifts} height mismatches after scroll`);
      console.log(`  before/after sample:`, before[0], '/', after[0]);
      if (errors.length) console.log(`  errors:`, errors.slice(0, 3));

      // Snap full page for visual sanity
      await page.screenshot({ path: path.join(artifactDir, `final-${vp.name}-top.png`), fullPage: false });
      await page.evaluate(() => window.scrollTo({ top: 1200, behavior: 'instant' }));
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(artifactDir, `final-${vp.name}-mid.png`), fullPage: false });

      await ctx.close();
    }
  } finally {
    await browser.close();
  }
})();
