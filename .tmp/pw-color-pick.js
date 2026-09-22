const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');
const url = require('node:url');
const { chromium } = require('playwright');

const artifactDir = 'C:\\Users\\General\\Documents\\GitHub\\Nanolix Build Landing Page\\.tmp';
const files = {
  icons: 'target-money-icons.png',       // 012652
  labels: 'target-money-labels.png',     // 012657
  cards: 'target-money-cards.png',       // 012645
  bodies: 'target-money-bodies.png',     // 012701
};

// Copy target screenshots into artifactDir
const sources = {
  'target-money-icons.png': 'c:/Users/General/Pictures/Screenshots/Screenshot 2026-09-22 012652.png',
  'target-money-labels.png': 'c:/Users/General/Pictures/Screenshots/Screenshot 2026-09-22 012657.png',
  'target-money-cards.png': 'c:/Users/General/Pictures/Screenshots/Screenshot 2026-09-22 012645.png',
  'target-money-bodies.png': 'c:/Users/General/Pictures/Screenshots/Screenshot 2026-09-22 012701.png',
};
for (const [name, src] of Object.entries(sources)) {
  fs.copyFileSync(src, path.join(artifactDir, name));
}

(async () => {
  const server = http.createServer((req, res) => {
    const u = url.parse(req.url);
    const p = path.join(artifactDir, decodeURIComponent(u.pathname));
    if (!fs.existsSync(p)) { res.writeHead(404); return res.end(); }
    const ext = path.extname(p).toLowerCase();
    const type = ext === '.png' ? 'image/png' : 'text/html';
    res.writeHead(200, { 'Content-Type': type });
    fs.createReadStream(p).pipe(res);
  });
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    const html = `<!doctype html><html><body style="margin:0;background:#000;">
      <canvas id="ic"></canvas>
      <canvas id="cd"></canvas>
      <canvas id="lb"></canvas>
      <canvas id="bd"></canvas>
      <script>
        async function loadImg(src) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = src;
          await new Promise((r) => { img.onload = r; });
          return img;
        }
        function drawTo(id, img) {
          const c = document.getElementById(id);
          c.width = img.naturalWidth;
          c.height = img.naturalHeight;
          const ctx = c.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(img, 0, 0);
          return ctx;
        }
        function rgb(ctx, x, y) {
          const d = ctx.getImageData(x, y, 1, 1).data;
          return d[0] + ',' + d[1] + ',' + d[2];
        }
        function hex(ctx, x, y) {
          const d = ctx.getImageData(x, y, 1, 1).data;
          const toHex = (v) => v.toString(16).padStart(2, '0');
          return '#' + toHex(d[0]) + toHex(d[1]) + toHex(d[2]);
        }
        (async () => {
          const icons = await loadImg('${base}/target-money-icons.png');
          const cards = await loadImg('${base}/target-money-cards.png');
          const labels = await loadImg('${base}/target-money-labels.png');
          const bodies = await loadImg('${base}/target-money-bodies.png');
          const ic = drawTo('ic', icons);
          const cd = drawTo('cd', cards);
          const lb = drawTo('lb', labels);
          const bd = drawTo('bd', bodies);
          const info = {
            icons: {
              size: [icons.naturalWidth, icons.naturalHeight],
              // Icon 1 (left) area — background likely ~x=40 y=20
              icon1_bg_center: hex(ic, 40, 22),
              icon1_bg_edge: hex(ic, 15, 22),
              icon1_stroke: hex(ic, 30, 30),
              icon1_page: hex(ic, 5, 5),
              icon2_bg_center: hex(ic, Math.round(icons.naturalWidth/2), 22),
              icon2_bg_edge: hex(ic, Math.round(icons.naturalWidth/2 + 30), 22),
              icon2_stroke: hex(ic, Math.round(icons.naturalWidth/2), 30),
              icon3_bg_center: hex(ic, icons.naturalWidth - 40, 22),
              icon3_stroke: hex(ic, icons.naturalWidth - 45, 25),
              icon3_page: hex(ic, icons.naturalWidth - 5, 5),
            },
            cards: {
              size: [cards.naturalWidth, cards.naturalHeight],
              // Icon boxes are near top of each card
              // Assume 3 columns split roughly evenly
              c1_icon_bg: hex(cd, 60, 40),
              c1_icon_edge: hex(cd, 20, 40),
              c1_label: hex(cd, 90, 100),
              c1_heading_gray: hex(cd, 30, 135),
              c1_heading_bright: hex(cd, 180, 135),
              c1_body: hex(cd, 40, 180),
              page_bg: hex(cd, 5, 5),
            },
          };
          document.title = JSON.stringify(info);
        })();
      </script>
    </body></html>`;
    await page.setContent(html);
    // wait for images and title to update
    await page.waitForFunction(() => document.title.includes('icons'), { timeout: 10000 });
    const info = await page.title();
    console.log(info);
  } finally {
    await browser.close();
    server.close();
  }
})();
