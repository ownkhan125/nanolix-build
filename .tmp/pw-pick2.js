const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('playwright');

const artifactDir = 'C:\\Users\\General\\Documents\\GitHub\\Nanolix Build Landing Page\\.tmp';

function b64(p) {
  return 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const dataIcons = b64(path.join(artifactDir, 'target-money-icons.png'));
    const dataCards = b64(path.join(artifactDir, 'target-money-cards.png'));
    const dataLabels = b64(path.join(artifactDir, 'target-money-labels.png'));

    const result = await page.evaluate(async ({ dataIcons, dataCards, dataLabels }) => {
      const load = (src) => new Promise((res) => {
        const img = new Image();
        img.onload = () => res(img);
        img.src = src;
      });
      const toCanvasCtx = (img) => {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        return ctx;
      };
      const hex = (ctx, x, y) => {
        const d = ctx.getImageData(x, y, 1, 1).data;
        const toHex = (v) => v.toString(16).padStart(2, '0');
        return '#' + toHex(d[0]) + toHex(d[1]) + toHex(d[2]);
      };
      const rgb = (ctx, x, y) => {
        const d = ctx.getImageData(x, y, 1, 1).data;
        return `rgb(${d[0]},${d[1]},${d[2]})`;
      };

      const icons = await load(dataIcons);
      const cards = await load(dataCards);
      const labels = await load(dataLabels);
      const ic = toCanvasCtx(icons);
      const cd = toCanvasCtx(cards);
      const lb = toCanvasCtx(labels);

      const iw = icons.naturalWidth, ih = icons.naturalHeight;
      const cw = cards.naturalWidth, ch = cards.naturalHeight;

      // Icons image is 789x43. Approx icon positions:
      // Icon 1 near left, icon 2 middle, icon 3 near right.
      // Icon box height ~35px, background is the rounded orange square.
      const iconSamples = {
        page_bg: hex(ic, 0, 0),
        icon1_center: hex(ic, 30, 20),        // should hit background
        icon1_far_corner: hex(ic, 5, 5),       // outside icon box - page bg
        icon1_stroke_maybe: hex(ic, 25, 15),   // sample near stroke
        icon2_center: hex(ic, 405, 20),
        icon2_dollar_stroke: hex(ic, 405, 12),
        icon3_center: hex(ic, 770, 20),
        icon3_shield_stroke: hex(ic, 762, 22),
      };
      // Scan across icons image to find where transitions happen
      const rowAt = (y) => {
        const arr = [];
        for (let x = 0; x < iw; x += 4) arr.push([x, hex(ic, x, y)]);
        return arr;
      };
      const iconRow = rowAt(20);

      // Cards image (1035x239): row shows 3 icon boxes at top
      // Each card ~ 1035/3 = 345 wide
      const cardSamples = {
        page_bg: hex(cd, 0, 0),
        c1_icon_bg_center: hex(cd, 50, 40),
        c1_icon_stroke: hex(cd, 40, 38),
        c1_area_below_icon: hex(cd, 40, 90),
        c1_label_region: hex(cd, 50, 88),
        c1_heading_word_start: hex(cd, 20, 130),
        c1_heading_middle: hex(cd, 200, 130),
        c1_heading_end: hex(cd, 360, 130),
        // sample body text darkness
        c1_body_dark: hex(cd, 30, 175),
      };
      // labels image (862x48): "Card 1 — The Model" and "Why do we build with no upfront design fee?"
      const labelSamples = {
        page_bg: hex(lb, 0, 0),
        card_label_gray: hex(lb, 30, 12),
        heading_first_word_area: hex(lb, 25, 35),
        heading_bright_area: hex(lb, 180, 35),
        heading_end_area: hex(lb, 380, 35),
      };
      return { iconSamples, cardSamples, labelSamples, iconRow_length: iconRow.length };
    }, { dataIcons, dataCards, dataLabels });
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await browser.close();
  }
})();
