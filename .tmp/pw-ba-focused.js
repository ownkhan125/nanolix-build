const path = require('node:path');
const { chromium } = require('playwright');

const targetUrl = process.env.TARGET_URL || 'http://localhost:3001';
const artifactDir = 'C:\\Users\\General\\Documents\\GitHub\\Nanolix Build Landing Page\\.tmp';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const label = page.getByText('See the', { exact: false }).first();
    await label.waitFor({ state: 'visible', timeout: 20000 });

    // Get bounding box of the heading itself
    const hbox = await label.boundingBox();
    console.log('heading box:', JSON.stringify(hbox));

    // Scroll section into view
    const section = label.locator('xpath=ancestor::section[1]');
    await section.evaluate((el) => {
      const y = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: y - 20, behavior: 'instant' });
    });
    await page.waitForTimeout(200);

    // Crop to match target 012117 aspect (285x171 => 1.667 wide) — but at a larger native
    // Grab ~570x342 area starting at the heading
    const rect = await label.evaluate((el) => {
      const r = el.getBoundingClientRect();
      // include eyebrow above heading + body below
      return { x: r.left - 4, y: r.top - 4, w: 570, h: 342 };
    });
    await page.screenshot({
      path: path.join(artifactDir, 'current-ba-heading-only.png'),
      clip: { x: rect.x, y: rect.y, width: rect.w, height: rect.h },
    });
    // Also grab from top-left of section including eyebrow
    const eyeText = page.getByText('Before / After', { exact: false }).first();
    const ebox = await eyeText.boundingBox();
    if (ebox) {
      await page.screenshot({
        path: path.join(artifactDir, 'current-ba-with-eyebrow.png'),
        clip: { x: Math.max(0, ebox.x - 4), y: Math.max(0, ebox.y - 12), width: 570, height: 380 },
      });
    }
    console.log('Saved current-ba-heading-only.png and current-ba-with-eyebrow.png');

    // Bottom caption region at similar aspect to target 012121 (696x114 -> ~6.1 aspect)
    const caption = page.getByText('Drag to compare. The right side', { exact: false }).first();
    const cbox = await caption.boundingBox();
    if (cbox) {
      // scroll to make sure caption + frame bottom are visible
      await caption.evaluate((el) => {
        const y = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: y - 200, behavior: 'instant' });
      });
      await page.waitForTimeout(200);
      const cbox2 = await caption.boundingBox();
      // capture ~50px above caption (bottom of frame) + caption line
      await page.screenshot({
        path: path.join(artifactDir, 'current-ba-caption-tight.png'),
        clip: { x: cbox2.x - 200, y: cbox2.y - 80, width: 1000, height: 130 },
      });
    }
    console.log('Saved current-ba-caption-tight.png');
  } finally {
    await browser.close();
  }
})();
