const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('playwright');

const targetUrl = process.env.TARGET_URL || 'http://localhost:3001';
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
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
      const page = await context.newPage();
      const consoleErrors = [];
      page.on('pageerror', (e) => consoleErrors.push(String(e)));
      page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });

      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2500);

      // Are all main headings tagged, and did the utility inject .mr-mask / .mr-inner spans?
      const stats = await page.evaluate(() => {
        const tagged = document.querySelectorAll('[data-reveal-heading]');
        const applied = document.querySelectorAll('[data-reveal-heading][data-reveal-applied="true"]');
        const totalInners = document.querySelectorAll('[data-reveal-heading] .mr-inner').length;
        const perHeading = Array.from(tagged).map((h) => ({
          tag: h.tagName,
          text: (h.textContent || '').replace(/\s+/g,' ').trim().slice(0, 60),
          inners: h.querySelectorAll('.mr-inner').length,
          height: Math.round(h.getBoundingClientRect().height),
        }));
        return { taggedCount: tagged.length, appliedCount: applied.length, totalInners, perHeading };
      });
      console.log(`--- ${vp.name} (${vp.width}x${vp.height}) ---`);
      console.log('tagged headings:', stats.taggedCount, 'applied:', stats.appliedCount, 'total word-inners:', stats.totalInners);
      console.log('per-heading:', JSON.stringify(stats.perHeading, null, 2));

      // Scroll down slowly to trigger reveals. Screenshot at 4 points.
      const totalHeight = await page.evaluate(() => document.body.scrollHeight);
      const points = [0, Math.round(totalHeight * 0.25), Math.round(totalHeight * 0.5), Math.round(totalHeight * 0.75)];
      for (const y of points) {
        await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y);
        await page.waitForTimeout(700);
        await page.screenshot({ path: path.join(artifactDir, `reveal-${vp.name}-y${y}.png`), fullPage: false });
      }

      // Scroll back to top to check reverse
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(artifactDir, `reveal-${vp.name}-back-top.png`), fullPage: false });

      if (consoleErrors.length) {
        console.log(`console errors on ${vp.name}:`, consoleErrors.slice(0, 5));
      } else {
        console.log(`no console errors on ${vp.name}`);
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }
})();
