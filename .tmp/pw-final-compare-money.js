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
    const context = await browser.newContext({ viewport: { width: 1300, height: 2200 } });
    const page = await context.newPage();

    const html = `<!doctype html><html><head><style>
      body { margin:0; background:#0a0a0a; color:#fff; font-family:sans-serif; padding:16px; }
      h3 { margin: 12px 0 6px; color:#ccc; font-size:14px; }
      .row { border:1px solid #333; margin-bottom:8px; }
      .cap { font-size:11px; color:#888; padding:4px 8px; background:#111; border-bottom:1px solid #333; }
      img { display:block; width:100%; }
    </style></head><body>
      <h3>Icons only — target then current-grid</h3>
      <div class="row"><div class="cap">TARGET 012652 (789x43)</div><img src="${base}/target-money-icons.png" /></div>

      <h3>Full cards — target</h3>
      <div class="row"><div class="cap">TARGET 012645 (1035x239)</div><img src="${base}/target-money-cards.png" /></div>

      <h3>Full cards — current</h3>
      <div class="row"><div class="cap">CURRENT money-grid</div><img src="${base}/current-money-grid.png" /></div>

      <h3>Labels + heading rows — target</h3>
      <div class="row"><div class="cap">TARGET 012657 (862x48)</div><img src="${base}/target-money-labels.png" /></div>

      <h3>Body text — target</h3>
      <div class="row"><div class="cap">TARGET 012701 (1003x133)</div><img src="${base}/target-money-bodies.png" /></div>
    </body></html>`;
    await page.setContent(html);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(artifactDir, 'final-compare-money.png'), fullPage: true });
    console.log('Saved final-compare-money.png');
  } finally {
    await browser.close();
    server.close();
  }
})();
