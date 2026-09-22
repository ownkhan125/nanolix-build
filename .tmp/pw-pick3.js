const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('playwright');

const artifactDir = 'C:\\Users\\General\\Documents\\GitHub\\Nanolix Build Landing Page\\.tmp';
function b64(p) { return 'data:image/png;base64,' + fs.readFileSync(p).toString('base64'); }

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const dataIcons = b64(path.join(artifactDir, 'target-money-icons.png'));
    const dataCards = b64(path.join(artifactDir, 'target-money-cards.png'));
    const dataLabels = b64(path.join(artifactDir, 'target-money-labels.png'));

    const result = await page.evaluate(async ({ dataIcons, dataCards, dataLabels }) => {
      const load = (src) => new Promise((res) => { const img = new Image(); img.onload = () => res(img); img.src = src; });
      const ctxOf = (img) => {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        return ctx;
      };
      const hex = (ctx, x, y) => {
        const d = ctx.getImageData(x, y, 1, 1).data;
        const toHex = (v) => v.toString(16).padStart(2, '0');
        return '#' + toHex(d[0]) + toHex(d[1]) + toHex(d[2]);
      };
      const brightness = (h) => {
        const r = parseInt(h.substr(1,2),16), g = parseInt(h.substr(3,2),16), b = parseInt(h.substr(5,2),16);
        return (r + g + b) / 3;
      };
      // For each row, find bright colors (text pixels) and record their hex
      const findTextPixels = (ctx, w, h, yStart, yEnd) => {
        const found = [];
        for (let y = yStart; y < yEnd; y++) {
          for (let x = 0; x < w; x++) {
            const c = hex(ctx, x, y);
            const b = brightness(c);
            if (b > 90) { // text/light pixel
              found.push({ x, y, c });
            }
          }
        }
        return found;
      };
      const findOrangePixels = (ctx, w, h) => {
        const found = [];
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const d = ctx.getImageData(x, y, 1, 1).data;
            // orange: R > 150, G < R, B < G
            if (d[0] > 150 && d[1] < d[0] - 30 && d[2] < d[1]) {
              const toHex = (v) => v.toString(16).padStart(2, '0');
              found.push({ x, y, c: '#' + toHex(d[0]) + toHex(d[1]) + toHex(d[2]) });
            }
          }
        }
        return found;
      };

      const icons = await load(dataIcons);
      const cards = await load(dataCards);
      const labels = await load(dataLabels);
      const ic = ctxOf(icons);
      const cd = ctxOf(cards);
      const lb = ctxOf(labels);

      // --- Icons image ---
      const iconOrange = findOrangePixels(ic, icons.naturalWidth, icons.naturalHeight);
      // Group unique-ish colors
      const uniqIconOrange = {};
      for (const p of iconOrange) uniqIconOrange[p.c] = (uniqIconOrange[p.c] || 0) + 1;
      const topIconColors = Object.entries(uniqIconOrange).sort((a,b) => b[1]-a[1]).slice(0, 8);

      // Sample where each icon starts by finding x-range of orange pixels
      const iconXs = iconOrange.map(p => p.x);
      const iconXBins = {};
      for (const x of iconXs) { const b = Math.floor(x/10); iconXBins[b] = (iconXBins[b]||0)+1; }

      // --- Cards image ---
      // find icon box bounds - orange in top area
      const cardOrange = [];
      for (let y = 0; y < 80; y++) {
        for (let x = 0; x < cards.naturalWidth; x++) {
          const d = ctx = null; // reset
          const dd = cd.getImageData(x, y, 1, 1).data;
          if (dd[0] > 100 && dd[0] > dd[1] * 1.5 && dd[0] > dd[2] * 2) {
            const toHex = (v) => v.toString(16).padStart(2, '0');
            cardOrange.push({ x, y, c: '#' + toHex(dd[0]) + toHex(dd[1]) + toHex(dd[2]) });
          }
        }
      }
      const uniqCardOrange = {};
      for (const p of cardOrange) uniqCardOrange[p.c] = (uniqCardOrange[p.c]||0)+1;
      const topCardOrange = Object.entries(uniqCardOrange).sort((a,b) => b[1]-a[1]).slice(0, 8);
      // group icon boxes by column (rough x-cluster)
      const cxs = cardOrange.map(p => p.x);
      const cxSet = [...new Set(cxs)].sort((a,b) => a-b);
      const clusters = [];
      let curr = [cxSet[0]];
      for (let i = 1; i < cxSet.length; i++) {
        if (cxSet[i] - cxSet[i-1] > 30) { clusters.push(curr); curr = []; }
        curr.push(cxSet[i]);
      }
      if (curr.length) clusters.push(curr);
      const clusterRanges = clusters.map(cl => [cl[0], cl[cl.length-1]]);

      // find heading text pixels — sample y=125..145
      // Distinguish word colors: white ~250,250,250 vs metallic silver ~155,155,155
      const cardTextY = [125, 130, 135, 140, 145];
      const textPixels = [];
      for (const y of cardTextY) {
        for (let x = 0; x < cards.naturalWidth; x++) {
          const d = cd.getImageData(x, y, 1, 1).data;
          const b = (d[0]+d[1]+d[2])/3;
          if (b > 80) textPixels.push({ x, y, r: d[0], g: d[1], b: d[2], bright: b });
        }
      }
      // count pixel brightness levels in words
      const brightLevels = {};
      for (const p of textPixels) {
        const bucket = Math.round(p.bright / 20) * 20;
        brightLevels[bucket] = (brightLevels[bucket]||0)+1;
      }

      // --- Labels image ---
      // First row = "Card N — Title"; second row = heading with mixed weight/color
      // Labels image is 862x48, so approx first row y=5-20, second row y=25-45
      // Find text pixels in second row
      const headingY = [30, 32, 35, 38, 40];
      const headingPixels = [];
      for (const y of headingY) {
        for (let x = 0; x < labels.naturalWidth; x++) {
          const d = lb.getImageData(x, y, 1, 1).data;
          const b = (d[0]+d[1]+d[2])/3;
          if (b > 80) headingPixels.push({ x, y, r: d[0], g: d[1], b: d[2], bright: b });
        }
      }
      const headBrightLevels = {};
      for (const p of headingPixels) {
        const bucket = Math.round(p.bright / 20) * 20;
        headBrightLevels[bucket] = (headBrightLevels[bucket]||0)+1;
      }

      return {
        topIconColors,
        clusterRanges,
        iconsSize: [icons.naturalWidth, icons.naturalHeight],
        topCardOrange,
        cardsSize: [cards.naturalWidth, cards.naturalHeight],
        cardBrightLevels: brightLevels,
        headBrightLevels,
        labelsSize: [labels.naturalWidth, labels.naturalHeight],
      };
    }, { dataIcons, dataCards, dataLabels });

    console.log(JSON.stringify(result, null, 2));
  } finally {
    await browser.close();
  }
})();
