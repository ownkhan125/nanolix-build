const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');
const url = require('node:url');
const { chromium } = require('playwright');

const artifactDir = 'C:\\Users\\General\\Documents\\GitHub\\Nanolix Build Landing Page\\.tmp';

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
    const context = await browser.newContext({ viewport: { width: 1200, height: 1400 } });
    const page = await context.newPage();

    // Force both crops to identical rendered width so structural wrap/colors align
    const html = `<!doctype html><html><head><style>
      body { margin:0; background:#0a0a0a; color:#fff; font-family:sans-serif; padding:16px; }
      h3 { margin: 16px 0 6px; color:#ccc; font-size:14px; }
      .pair { display:grid; grid-template-columns: 1fr 1fr; gap:14px; align-items:start; }
      .col { border:1px solid #333; }
      .cap { font-size:11px; color:#888; padding:4px 8px; background:#111; border-bottom:1px solid #333; }
      img { display:block; width:100%; height:auto; image-rendering:auto; }
    </style></head><body>
      <h3>Heading area — target vs current (rescaled to same width)</h3>
      <div class="pair">
        <div class="col"><div class="cap">TARGET 012117 (285x171)</div><img src="${base}/target-ba-top.png" /></div>
        <div class="col"><div class="cap">CURRENT (570x342, 2x scale)</div><img src="${base}/current-ba-heading-only.png" /></div>
      </div>
      <h3>Bottom edge + caption — target vs current</h3>
      <div class="pair">
        <div class="col"><div class="cap">TARGET 012121 (696x114)</div><img src="${base}/target-ba-bottom.png" /></div>
        <div class="col"><div class="cap">CURRENT ba-caption (1240x200)</div><img src="${base}/current-ba-caption.png" /></div>
      </div>
    </body></html>`;
    await page.setContent(html);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(artifactDir, 'final-compare-ba.png'), fullPage: true });
    console.log('Saved final-compare-ba.png');
  } finally {
    await browser.close();
    server.close();
  }
})();
