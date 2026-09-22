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
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
      const page = await context.newPage();
      await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2500);

      // For each heading, scroll it into center of viewport and snap a screenshot centered on it.
      const headings = await page.$$('[data-reveal-heading]');
      console.log(`--- ${vp.name} ${vp.width}x${vp.height}: ${headings.length} headings ---`);
      for (let i = 0; i < headings.length; i++) {
        const h = headings[i];
        // Get text label for filename
        const text = (await h.innerText()).replace(/\s+/g,'_').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 30) || 'h' + i;
        // Scroll heading to middle of viewport, wait for animation
        await h.evaluate((el) => {
          const rect = el.getBoundingClientRect();
          const target = window.scrollY + rect.top - window.innerHeight * 0.35;
          window.scrollTo({ top: Math.max(0, target), behavior: 'instant' });
        });
        await page.waitForTimeout(1600); // reveal + settle
        const box = await h.boundingBox();
        if (!box) continue;
        await page.screenshot({
          path: path.join(artifactDir, `section-${vp.name}-${String(i).padStart(2,'0')}-${text}.png`),
          clip: {
            x: Math.max(0, box.x - 40),
            y: Math.max(0, box.y - 30),
            width: Math.min(vp.width, box.width + 80),
            height: box.height + 60,
          },
        });
        // Also capture computed transform of first inner
        const info = await h.evaluate((el) => {
          const inner = el.querySelector('.mr-inner');
          return {
            text: inner?.textContent,
            transform: inner ? getComputedStyle(inner).transform : null,
            color: inner ? getComputedStyle(inner).color : null,
            fill: inner ? getComputedStyle(inner).webkitTextFillColor : null,
            background: inner ? getComputedStyle(inner).backgroundImage : null,
          };
        });
        console.log(`  h${i} "${text.slice(0,20)}"`, JSON.stringify(info));
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }
})();
