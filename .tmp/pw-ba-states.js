const { chromium } = require('playwright');

const targetUrl = 'http://localhost:3001';
const outDir = 'C:\\Users\\General\\Documents\\GitHub\\Nanolix Build Landing Page\\.tmp\\';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const heading = page.locator('h2', { hasText: 'See the' }).first();
    await heading.waitFor({ state: 'visible', timeout: 20000 });
    await heading.evaluate((el) => {
      const y = el.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top: y, behavior: 'instant' });
    });
    await page.waitForTimeout(300);
    const frame = page.locator('.ba-frame').first();
    const box = await frame.boundingBox();
    console.log('frame:', JSON.stringify(box));

    // For each pos, drag the handle and capture
    async function setPos(percent) {
      const btn = page.locator('button[aria-label="Drag to compare"]').first();
      const bb = await btn.boundingBox();
      const wrapRect = await frame.evaluate((el) => {
        const w = el.querySelector('div[style*="userSelect"]') || el.children[1];
        const r = w.getBoundingClientRect();
        return { x: r.x, y: r.y, w: r.width, h: r.height };
      });
      const targetX = wrapRect.x + (wrapRect.w * percent / 100);
      await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
      await page.mouse.down();
      await page.mouse.move(targetX, wrapRect.y + wrapRect.h / 2, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(200);
    }

    for (const p of [10, 44, 90]) {
      await setPos(p);
      const info = await frame.evaluate((el) => {
        const before = el.querySelector('div[style*="pointerEvents: none"]') || Array.from(el.querySelectorAll('div')).find(d => d.style.pointerEvents === 'none');
        const cs = before ? getComputedStyle(before) : null;
        return { beforeWidth: cs ? cs.width : null, beforeOverflow: cs ? cs.overflow : null };
      });
      console.log(`pos=${p}:`, JSON.stringify(info));
      await page.screenshot({ path: outDir + `current-ba-p${p}.png`, clip: { x: Math.max(0, box.x - 5), y: Math.max(0, box.y - 5), width: Math.min(1440, box.width + 10), height: Math.min(900, box.height + 10) } });
    }
  } finally {
    await browser.close();
  }
})();
