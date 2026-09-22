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
    const context = await browser.newContext({ viewport: { width: 1400, height: 1800 } });
    const page = await context.newPage();

    const html = `<!doctype html><html><head><style>
      body { margin:0; background:#0a0a0a; color:#fff; font-family:sans-serif; padding:16px; }
      h3 { margin: 20px 0 8px; color:#ccc; font-size:16px; font-weight:600; }
      .row { display:flex; gap:12px; align-items:flex-start; }
      .col { flex:1; border:1px solid #333; }
      .cap { font-size:12px; color:#888; padding:6px 10px; background:#111; border-bottom:1px solid #333; }
      img { display:block; width:100%; }
    </style></head><body>
      <h3>Top left column — target (left) vs current (right)</h3>
      <div class="row">
        <div class="col"><div class="cap">TARGET 012117</div><img src="${base}/target-ba-top.png" /></div>
        <div class="col"><div class="cap">CURRENT ba-left</div><img src="${base}/current-ba-left.png" /></div>
      </div>
      <h3>Bottom caption — target (left) vs current (right)</h3>
      <div class="row">
        <div class="col"><div class="cap">TARGET 012121</div><img src="${base}/target-ba-bottom.png" /></div>
        <div class="col"><div class="cap">CURRENT ba-caption</div><img src="${base}/current-ba-caption.png" /></div>
      </div>
    </body></html>`;
    await page.setContent(html);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(artifactDir, 'compare-ba.png'), fullPage: true });
    console.log('Saved compare-ba.png');
  } finally {
    await browser.close();
    server.close();
  }
})();
