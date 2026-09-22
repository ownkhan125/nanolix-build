const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('playwright');

const artifactDir = 'C:\\Users\\General\\Documents\\GitHub\\Nanolix Build Landing Page\\.tmp';
const target1 = 'c:/Users/General/Pictures/Screenshots/Screenshot 2026-09-22 010124.png';
const current1 = path.join(artifactDir, 'current-trust.png');
const currentHero = path.join(artifactDir, 'current-hero.png');
const target2 = 'c:/Users/General/Pictures/Screenshots/Screenshot 2026-09-22 010115.png';
const target3 = 'c:/Users/General/Pictures/Screenshots/Screenshot 2026-09-22 010109.png';
const target4 = 'c:/Users/General/Pictures/Screenshots/Screenshot 2026-09-22 010103.png';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 2400 } });
    const html = `<!doctype html><html><head><style>
body { margin:0; background:#0a0a0a; color:#fff; font-family:sans-serif; padding:16px; }
h3 { margin: 12px 0 4px; color:#aaa; font-size:14px; font-weight:600; }
.row { display:flex; gap:20px; flex-wrap:wrap; }
.item { border:1px solid #333; }
img { display:block; max-width: 100%; }
.label { font-size:12px; color:#888; padding:4px 8px; background:#111; }
</style></head><body>
<h3>TARGET 010124 (all three cards)</h3>
<div class="item"><div class="label">TARGET</div><img src="file:///${target1.replace(/\\/g,'/')}" /></div>
<h3>CURRENT TrustBar rendering</h3>
<div class="item"><div class="label">CURRENT</div><img src="file:///${current1.replace(/\\/g,'/')}" /></div>
<h3>Individual target snippets</h3>
<div class="row">
<div class="item"><div class="label">010115 process</div><img src="file:///${target2.replace(/\\/g,'/')}" /></div>
<div class="item"><div class="label">010109 offer</div><img src="file:///${target3.replace(/\\/g,'/')}" /></div>
<div class="item"><div class="label">010103 work label</div><img src="file:///${target4.replace(/\\/g,'/')}" /></div>
</div>
<h3>CURRENT hero rendering</h3>
<div class="item"><div class="label">CURRENT HERO</div><img src="file:///${currentHero.replace(/\\/g,'/')}" /></div>
</body></html>`;
    await page.setContent(html);
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(artifactDir, 'compare.png'), fullPage: true });
    console.log('Saved compare.png');
  } finally {
    await browser.close();
  }
})();
