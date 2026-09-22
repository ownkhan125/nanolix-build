const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('playwright');

const artifactDir = 'C:\\Users\\General\\Documents\\GitHub\\Nanolix Build Landing Page\\.tmp';

// Copy target images into .tmp so we can serve them via playwright without file:// issues
const files = {
  target1: 'c:/Users/General/Pictures/Screenshots/Screenshot 2026-09-22 010124.png',
  target2: 'c:/Users/General/Pictures/Screenshots/Screenshot 2026-09-22 010115.png',
  target3: 'c:/Users/General/Pictures/Screenshots/Screenshot 2026-09-22 010109.png',
  target4: 'c:/Users/General/Pictures/Screenshots/Screenshot 2026-09-22 010103.png',
};
for (const [k, src] of Object.entries(files)) {
  fs.copyFileSync(src, path.join(artifactDir, `target-${k}.png`));
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1600, height: 1200 } });
    const page = await context.newPage();
    // Serve the .tmp folder from a small server so we can load images
    const http = require('node:http');
    const url = require('node:url');
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

    const html = `<!doctype html><html><head><style>
      body { margin:0; background:#0a0a0a; color:#fff; font-family:sans-serif; padding:16px; }
      h3 { margin: 16px 0 6px; color:#ccc; font-size:14px; font-weight:600; }
      .item { border:1px solid #333; margin-bottom: 8px; }
      img { display:block; width: 1440px; }
      img.small { width: auto; max-width: 100%; }
      .caption { font-size:12px; color:#888; padding:4px 8px; background:#111; border-bottom: 1px solid #333; }
    </style></head><body>
      <h3>TARGET 010124 (upscaled to 1440 for comparison)</h3>
      <div class="item"><div class="caption">TARGET</div><img src="${base}/target-target1.png" /></div>
      <h3>CURRENT TrustBar rendering (already 1440 wide)</h3>
      <div class="item"><div class="caption">CURRENT</div><img src="${base}/current-trust.png" /></div>
    </body></html>`;
    await page.setContent(html);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(artifactDir, 'compare2.png'), fullPage: true });
    console.log('Saved compare2.png');
    server.close();
  } finally {
    await browser.close();
  }
})();
