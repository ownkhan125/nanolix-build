const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('playwright');

const artifactDir = 'C:\\Users\\General\\Documents\\GitHub\\Nanolix Build Landing Page\\.tmp';
function b64(p) { return 'data:image/png;base64,' + fs.readFileSync(p).toString('base64'); }

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const dataLabels = b64(path.join(artifactDir, 'target-money-labels.png'));

    const result = await page.evaluate(async ({ dataLabels }) => {
      const load = (src) => new Promise((res) => { const img = new Image(); img.onload = () => res(img); img.src = src; });
      const ctxOf = (img) => {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        return ctx;
      };
      const toHex = (v) => v.toString(16).padStart(2, '0');
      const pxHex = (ctx, x, y) => {
        const d = ctx.getImageData(x, y, 1, 1).data;
        return '#' + toHex(d[0]) + toHex(d[1]) + toHex(d[2]);
      };
      const labels = await load(dataLabels);
      const lb = ctxOf(labels);
      const W = labels.naturalWidth, H = labels.naturalHeight;

      // labels image is 862x48. Two rows: label row (~y=5-20) and heading row (~y=25-45)
      // For every column, find the brightest pixel in the heading row and record its brightness
      const cols = [];
      for (let x = 0; x < W; x++) {
        let maxBright = 0, maxC = '#000000';
        for (let y = 20; y < H; y++) {
          const d = lb.getImageData(x, y, 1, 1).data;
          const b = (d[0]+d[1]+d[2])/3;
          if (b > maxBright) { maxBright = b; maxC = '#' + toHex(d[0]) + toHex(d[1]) + toHex(d[2]); }
        }
        cols.push({ x, brightness: Math.round(maxBright), color: maxC });
      }

      // Segment: find runs of "text" (brightness > 60) and "gap" (brightness < 30)
      // Then classify each text run by its dominant brightness bucket
      const runs = [];
      let cur = null;
      for (const c of cols) {
        const isText = c.brightness > 60;
        if (isText) {
          if (!cur || cur.type !== 'text') {
            if (cur) runs.push(cur);
            cur = { type: 'text', x1: c.x, x2: c.x, bs: [c.brightness], colors: [c.color] };
          } else {
            cur.x2 = c.x; cur.bs.push(c.brightness); cur.colors.push(c.color);
          }
        } else {
          if (cur && cur.type === 'text') {
            if (c.x - cur.x2 > 2) { runs.push(cur); cur = { type: 'gap', x1: c.x, x2: c.x }; }
          } else if (cur) {
            cur.x2 = c.x;
          } else {
            cur = { type: 'gap', x1: c.x, x2: c.x };
          }
        }
      }
      if (cur) runs.push(cur);

      // Merge tiny gaps (< 5px) between text runs into a bigger word chunk
      // We assume word boundaries have wider gaps
      const words = [];
      let acc = null;
      for (const r of runs) {
        if (r.type === 'text') {
          if (acc) acc.x2 = r.x2;
          else acc = { x1: r.x1, x2: r.x2, bs: [], colors: [] };
          acc.bs.push(...r.bs);
          acc.colors.push(...r.colors);
        } else {
          const w = r.x2 - r.x1;
          if (w > 6) {
            // word boundary
            if (acc) { words.push(acc); acc = null; }
          }
        }
      }
      if (acc) words.push(acc);

      // For each word, compute avg brightness & max brightness
      const wordSummaries = words.map((w, i) => {
        const avg = w.bs.reduce((a,b) => a+b, 0) / w.bs.length;
        const mx = Math.max(...w.bs);
        return { i, x1: w.x1, x2: w.x2, w: w.x2 - w.x1, avg: Math.round(avg), max: mx };
      });

      return { wordSummaries };
    }, { dataLabels });

    console.log(JSON.stringify(result, null, 2));
  } finally {
    await browser.close();
  }
})();
