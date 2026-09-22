const { chromium } = require('playwright');

const targetUrl = 'http://localhost:3001';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const info = await page.evaluate(() => {
      const grid = document.querySelector('.care-grid');
      const cards = Array.from(document.querySelectorAll('.care-card'));
      const gs = getComputedStyle(grid);
      return {
        grid: {
          rect: grid.getBoundingClientRect().toJSON(),
          gridTemplateColumns: gs.gridTemplateColumns,
          alignItems: gs.alignItems,
          gap: gs.gap,
        },
        cards: cards.map(c => ({
          className: c.className,
          rect: c.getBoundingClientRect().toJSON(),
        })),
      };
    });
    console.log(JSON.stringify(info, null, 2));
  } finally {
    await browser.close();
  }
})();
