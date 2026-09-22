const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require("playwright");

const url = process.env.TARGET_URL || "http://localhost:3001/";
const outDir = path.resolve(".figma/screens/buttons");
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet",  width: 768,  height: 1024 },
  { name: "mobile",  width: 375,  height: 812 },
];

// Selectors + section anchors for each button we want to test.
const targets = [
  { key: "header-apply",     anchor: null,        selector: 'header a:has-text("Apply")' },
  { key: "hero-primary",     anchor: null,        selector: 'section:has(h1) a:has-text("Apply in 2 minutes")' },
  { key: "hero-secondary",   anchor: null,        selector: 'section:has(h1) a:has-text("Book a 15-Minute Call")' },
  { key: "audience-tab-1",   anchor: "#audience", selector: '#audience li:nth-child(2) button' },
  { key: "careplans-apply",  anchor: null,        selectorLast: 'a:has-text("Apply in 2 minutes")', scrollText: "Care plan" },
  { key: "apply-submit",     anchor: "#apply",    selector: 'button:has-text("Continue, one minute left")' },
  { key: "apply-booking",    anchor: "#apply",    selector: 'a:has-text("Show available times")' },
  { key: "faq-toggle",       anchor: "#faq",      selector: '#faq button' },
  { key: "cta-primary",      anchor: null,        selectorLast: 'a:has-text("Apply in 2 minutes")', scrollText: "A real person reviews" },
  { key: "cta-secondary",    anchor: null,        selectorLast: 'a:has-text("Book a 15-Minute Call")', scrollText: "A real person reviews" },
];

async function scrollToSelector(page, selector) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ block: "center" });
  }, selector);
  await page.waitForTimeout(200);
}

async function scrollToText(page, text) {
  await page.evaluate((t) => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent.includes(t)) {
        node.parentElement.scrollIntoView({ block: "center" });
        return;
      }
    }
  }, text);
  await page.waitForTimeout(200);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  let totalErrors = 0;
  const layoutIssues = [];

  try {
    for (const v of viewports) {
      const ctx = await browser.newContext({
        viewport: { width: v.width, height: v.height },
        deviceScaleFactor: 1,
      });
      const page = await ctx.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);

      for (const t of targets) {
        // Open mobile menu if needed for header-apply on mobile
        if (t.key === "header-apply" && v.width < 768) {
          const burger = await page.$('button[aria-label="Toggle menu"]');
          if (burger) { await burger.click(); await page.waitForTimeout(300); }
        }

        if (t.anchor) {
          await page.evaluate((a) => document.querySelector(a)?.scrollIntoView({ block: "start" }), t.anchor);
          await page.waitForTimeout(300);
        }
        if (t.scrollText) await scrollToText(page, t.scrollText);

        let handle;
        if (t.selectorLast) {
          const all = await page.$$(t.selectorLast);
          handle = all[all.length - 1];
        } else {
          handle = await page.$(t.selector);
        }
        if (!handle) { console.log(`[${v.name}] ${t.key}: NOT FOUND`); continue; }

        const box0 = await handle.boundingBox();
        if (!box0) continue;
        await handle.scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        const boxRest = await handle.boundingBox();
        await handle.hover({ position: { x: 20, y: 15 } });
        await page.waitForTimeout(400);
        const boxHov = await handle.boundingBox();

        // Layout stability: width/height shift more than 3px = layout break
        const dW = Math.abs((boxHov.width || 0) - (boxRest.width || 0));
        const dH = Math.abs((boxHov.height || 0) - (boxRest.height || 0));
        const dX = Math.abs((boxHov.x || 0) - (boxRest.x || 0));
        const dY = Math.abs((boxHov.y || 0) - (boxRest.y || 0));
        if (dW > 3 || dH > 3) {
          layoutIssues.push(`[${v.name}] ${t.key} size shift dW=${dW.toFixed(1)} dH=${dH.toFixed(1)}`);
        }

        const outFile = path.join(outDir, `${v.name}-${t.key}-hover.png`);
        // Screenshot a padded region around the button so overlays like halo are captured
        const pad = 30;
        const clip = {
          x: Math.max(0, boxHov.x - pad),
          y: Math.max(0, boxHov.y - pad),
          width: Math.min(v.width, boxHov.width + pad * 2),
          height: Math.min(v.height, boxHov.height + pad * 2),
        };
        await page.screenshot({ path: outFile, clip });

        // Move mouse away to reset for next iteration
        await page.mouse.move(0, 0);
        await page.waitForTimeout(200);
      }

      console.log(`[${v.name}] errors=${errors.length}`);
      if (errors.length) errors.forEach((e) => console.log("  ERR:", e));
      totalErrors += errors.length;
      await ctx.close();
    }
  } finally {
    await browser.close();
  }

  console.log("\n=== Summary ===");
  console.log("Total console errors:", totalErrors);
  if (layoutIssues.length) {
    console.log("Layout shifts detected:");
    layoutIssues.forEach((l) => console.log(" - " + l));
  } else {
    console.log("No layout shifts detected on any button hover.");
  }
})();
