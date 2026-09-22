const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require("playwright");

const url = process.env.TARGET_URL || "http://localhost:3001/";
const outDir = path.resolve(".figma/screens/sections");
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    // Screenshot the header apply
    const header = await page.$("header");
    if (header) await header.screenshot({ path: path.join(outDir, "btn-header.png") });

    // Hero CTAs
    const heroBtn = await page.$("text=Apply in 2 minutes");
    if (heroBtn) {
      const hero = await heroBtn.evaluateHandle((el) => el.closest("section"));
      if (hero.asElement()) await hero.asElement().screenshot({ path: path.join(outDir, "btn-hero.png") });
    }

    // Hover hero primary and screenshot
    if (heroBtn) {
      await heroBtn.hover();
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(outDir, "btn-hero-hover.png"), clip: { x: 0, y: 0, width: 1440, height: 900 } });
    }

    // Scroll to Apply section
    await page.evaluate(() => document.querySelector("#apply")?.scrollIntoView({ block: "start" }));
    await page.waitForTimeout(500);
    const applySec = await page.$("#apply");
    if (applySec) await applySec.screenshot({ path: path.join(outDir, "btn-apply.png") });

    // Hover form submit
    const submit = await page.$("text=Continue, one minute left");
    if (submit) {
      await submit.hover();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, "btn-submit-hover.png"), clip: { x: 0, y: 200, width: 1440, height: 700 } });
    }

    // Scroll to CTA (bottom)
    await page.evaluate(() => document.querySelectorAll("section").forEach((s) => { if (s.textContent.includes("A real person reviews every application")) s.scrollIntoView({ block: "start" }); }));
    await page.waitForTimeout(400);
    // Hover CTA primary
    const ctaBtn = await page.$$("text=Apply in 2 minutes");
    if (ctaBtn.length) {
      await ctaBtn[ctaBtn.length - 1].hover();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(outDir, "btn-cta-hover.png"), clip: { x: 0, y: 100, width: 1440, height: 700 } });
    }

    console.log("errors:", errors.length);
    if (errors.length) errors.forEach((e) => console.log("  ERR:", e));
    await ctx.close();
  } finally {
    await browser.close();
  }
})();
