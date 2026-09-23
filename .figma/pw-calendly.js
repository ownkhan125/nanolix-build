const { chromium } = require("playwright");

const url = process.env.TARGET_URL || "http://localhost:3001/";

const targets = [
  { key: "hero-book",     selector: 'section#top a:has-text("Book a 15-Minute Call")' },
  { key: "apply-book",    selector: 'section#apply a:has-text("Show available times")' },
  { key: "apply-newtab",  selector: 'section#apply a:has-text("Open it in a new tab")' },
  { key: "cta-book",      selector: 'section#cta a:has-text("Book a 15-Minute Call")' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    await page.goto(url, { waitUntil: "networkidle" });
    // Give Calendly widget.js time to attach (loaded afterInteractive)
    await page.waitForFunction(() => window.Calendly && typeof window.Calendly.initPopupWidget === "function", { timeout: 8000 }).catch(() => {});

    for (const t of targets) {
      const el = await page.$(t.selector);
      if (!el) { results.push(`${t.key}: NOT FOUND`); continue; }
      // Read href
      const href = await el.evaluate((e) => e.getAttribute("href"));
      // Scroll into view + click
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      const before = await el.boundingBox();
      await el.click();
      await page.waitForTimeout(600);
      // For the "new tab" link we don't expect a popup — instead check href points to calendly and target=_blank
      if (t.key === "apply-newtab") {
        const target = await el.evaluate((e) => e.getAttribute("target"));
        results.push(`${t.key}: href=${href} target=${target}`);
        continue;
      }
      // Otherwise expect the Calendly overlay to be present
      const popupCount = await page.evaluate(() => document.querySelectorAll(".calendly-overlay, .calendly-popup").length);
      results.push(`${t.key}: href=${href} → overlays after click=${popupCount}`);
      // Clean up: close overlay if present
      await page.evaluate(() => {
        if (window.Calendly && typeof window.Calendly.closePopupWidget === "function") window.Calendly.closePopupWidget();
        document.querySelectorAll(".calendly-overlay").forEach((el) => el.remove());
      });
      await page.waitForTimeout(200);
      const after = await el.boundingBox();
      if (before && after) {
        const dW = Math.abs(after.width - before.width);
        const dH = Math.abs(after.height - before.height);
        if (dW > 1 || dH > 1) results.push(`${t.key}: LAYOUT SHIFT dW=${dW} dH=${dH}`);
      }
    }

    console.log(results.join("\n"));
    console.log("\nConsole errors:", errors.length ? errors.length : "0");
    if (errors.length) errors.forEach((e) => console.log("  ERR:", e));
    await ctx.close();
  } finally {
    await browser.close();
  }
})();
