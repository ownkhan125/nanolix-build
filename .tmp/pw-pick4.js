const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('playwright');

const artifactDir = 'C:\\Users\\General\\Documents\\GitHub\\Nanolix Build Landing Page\\.tmp';
function b64(p) { return 'data:image/png;base64,' + fs.readFileSync(p).toString('base64'); }

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const dataCards = b64(path.join(artifactDir, 'target-money-cards.png'));
    const dataLabels = b64(path.join(artifactDir, 'target-money-labels.png'));
    const dataIcons = b64(path.join(artifactDir, 'target-money-icons.png'));

    const result = await page.evaluate(async ({ dataCards, dataLabels, dataIcons }) => {
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

      const cards = await load(dataCards);
      const labels = await load(dataLabels);
      const icons = await load(dataIcons);
      const cd = ctxOf(cards);
      const lb = ctxOf(labels);
      const ic = ctxOf(icons);

      // Cards image is 1035x239. Cards laid out roughly:
      // Card 1: x=0..345
      // Card 2: x=345..690
      // Card 3: x=690..1035
      // Icon box top area around y=15..55
      // Sample a dense grid inside each icon box area (padding-in from edges)

      const samples = {};
      // Icon box background samples (avoiding icon strokes)
      // Try to find a "clean" background pixel by searching downward from y=15
      // Sample many points in expected icon box (small square in top-left of each card)
      for (let card = 0; card < 3; card++) {
        const cx0 = card * 345 + 30;
        const boxKey = `card${card+1}_iconbox`;
        samples[boxKey] = [];
        for (let dy = 15; dy <= 55; dy += 5) {
          for (let dx = 0; dx <= 40; dx += 5) {
            samples[boxKey].push({ x: cx0+dx, y: dy, c: pxHex(cd, cx0+dx, dy) });
          }
        }
      }

      // Sample colors in "card label" row (y ~85-95) & "heading" row (y ~125-155)
      for (let card = 0; card < 3; card++) {
        const cx0 = card * 345 + 30;
        const label = `card${card+1}_label_row`;
        samples[label] = [];
        for (let dx = 0; dx <= 200; dx += 8) {
          samples[label].push({ x: cx0+dx, y: 88, c: pxHex(cd, cx0+dx, 88) });
        }
        const head = `card${card+1}_heading_row`;
        samples[head] = [];
        for (let dx = 0; dx <= 320; dx += 5) {
          samples[head].push({ x: cx0+dx, y: 132, c: pxHex(cd, cx0+dx, 132) });
        }
      }

      // ICONS-ONLY IMAGE: 789x43. Look at each icon box center for background color
      const icBoxes = [
        { name: 'icon1_dark_bg', x: 42, y: 22 }, // background just outside strokes but inside box
        { name: 'icon2_dark_bg', x: 460, y: 22 },
        { name: 'icon3_dark_bg', x: 706, y: 22 },
        { name: 'icon1_edge_bg', x: 90, y: 22 }, // right edge of box 1
        { name: 'icon2_edge_bg', x: 505, y: 22 },
        { name: 'icon3_edge_bg', x: 748, y: 22 },
      ];
      samples.icon_boxes = icBoxes.map(o => ({ ...o, c: pxHex(ic, o.x, o.y) }));

      // Also horizontal scan at icons y=20 to identify box edges by color transitions
      const iw = icons.naturalWidth;
      const scan = [];
      for (let x = 0; x < iw; x += 2) {
        scan.push({ x, c: pxHex(ic, x, 20) });
      }
      // Find first non-black pixel from left, first bright orange, first return to dark
      samples.icons_scan_summary = {
        first_nonBlack_from_left: scan.find(p => p.c !== '#000000'),
        first_bright_orange: scan.find(p => {
          const d = parseInt(p.c.substr(1,2),16);
          return d > 200;
        }),
        // for each x-group of 40px, average
      };
      // Provide the whole scan as a compressed summary of transitions
      const transitions = [];
      let prev = null;
      for (const p of scan) {
        if (prev === null || p.c !== prev.c) {
          transitions.push(p);
          prev = p;
        }
      }
      samples.icons_transitions_first50 = transitions.slice(0, 50);

      return samples;
    }, { dataCards, dataLabels, dataIcons });

    console.log(JSON.stringify(result, null, 2));
  } finally {
    await browser.close();
  }
})();
