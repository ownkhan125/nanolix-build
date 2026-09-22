const path = require('node:path');
const { chromium } = require('playwright');

const artifactDir = 'C:\\Users\\General\\Documents\\GitHub\\Nanolix Build Landing Page\\.tmp';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    // Pick a below-fold section — WhereTheMoney H2
    const target = page.locator('h2[data-reveal-heading]').filter({ hasText: /We would rather show/ }).first();
    await target.waitFor();

    // Scroll target JUST INTO view (top hits 88% mark). Then snap frames rapidly during reveal.
    await target.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight;
      // Put heading top at 90% of viewport (just crossing 88% start)
      const desiredTopInViewport = viewportH * 0.87;
      const scrollDelta = rect.top - desiredTopInViewport;
      window.scrollBy({ top: scrollDelta, behavior: 'instant' });
    });
    // Immediately snap frames every 120ms to observe reveal
    for (let i = 0; i < 8; i++) {
      const box = await target.boundingBox();
      if (box) {
        await page.screenshot({
          path: path.join(artifactDir, `anim-frame-${String(i).padStart(2,'0')}.png`),
          clip: {
            x: Math.max(0, box.x - 30),
            y: Math.max(0, box.y - 30),
            width: 900,
            height: box.height + 80,
          },
        });
      }
      await page.waitForTimeout(150);
    }

    // Now scroll UP so the heading exits viewport top — it should reverse-hide
    // First scroll DOWN way past it
    await page.evaluate(() => window.scrollBy({ top: 900, behavior: 'instant' }));
    await page.waitForTimeout(600);
    // Then scroll all the way back up to top
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(300);
    // Snap the target while it's hidden (should be)
    const box = await target.boundingBox();
    // It's now below fold at top, invisible. But we want to catch it during reverse.
    // Let's re-scroll to just above start, then check state.
    await target.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight;
      // put heading top BELOW the 88% start (i.e., not yet triggered)
      const desiredTopInViewport = viewportH * 0.95;
      const scrollDelta = rect.top - desiredTopInViewport;
      window.scrollBy({ top: scrollDelta, behavior: 'instant' });
    });
    await page.waitForTimeout(200);
    const state = await target.evaluate((el) => {
      const inners = el.querySelectorAll('.mr-inner');
      return Array.from(inners).slice(0, 3).map((i) => ({
        text: i.textContent,
        transform: getComputedStyle(i).transform,
      }));
    });
    console.log('post-reverse state (should be at yPercent 115 = translate ~40-80px):', JSON.stringify(state, null, 2));
  } finally {
    await browser.close();
  }
})();
