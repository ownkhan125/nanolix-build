const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require("playwright");

const url = process.env.TARGET_URL || "http://localhost:3001/";
const outDir = path.resolve(".figma/screens/responsive");
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: "mobile-375",   width: 375,  height: 900 },
  { name: "mobile-480",   width: 480,  height: 900 },
  { name: "tablet-640",   width: 640,  height: 900 },
  { name: "tablet-676",   width: 676,  height: 900 },
  { name: "tablet-768",   width: 768,  height: 1024 },
  { name: "tablet-900",   width: 900,  height: 1024 },
  { name: "tablet-1024",  width: 1024, height: 1024 },
  { name: "desktop-1200", width: 1200, height: 900 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

const sections = [
  { id: "top",      key: "hero" },
  { id: "audience", key: "audience" },
  { id: "scope",    key: "scope" },
  { id: "pricing",  key: "pricing" },
  { id: "apply",    key: "apply" },
  { id: "faq",      key: "faq" },
  { id: "cta",      key: "cta" },
];

const sectionMatchers = [
  { key: "beforeafter", selector: ".ba-frame" },
  { key: "howitworks",  selector: ".how-grid" },
  { key: "proof",       selector: ".proof-grid" },
  { key: "money",       selector: ".money-grid" },
  { key: "fit",         selector: ".fit-grid" },
  { key: "footer",      selector: ".footer-grid" },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const problems = [];
  const allErrors = [];

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

      // Horizontal overflow check
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return {
          scrollW: doc.scrollWidth,
          clientW: doc.clientWidth,
          overflow: Math.max(0, doc.scrollWidth - doc.clientWidth),
        };
      });
      if (overflow.overflow > 0) {
        problems.push(`[${v.name}] horizontal overflow: ${overflow.overflow}px (scrollW=${overflow.scrollW} clientW=${overflow.clientW})`);
      }

      // Header measurements
      const headerH = await page.evaluate(() => {
        const h = document.querySelector("header");
        return h ? h.getBoundingClientRect().height : 0;
      });

      // First pass: scroll to bottom so all ScrollTriggers fire.
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(600);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(400);

      // Section-level screenshots — center each section then capture.
      for (const s of sections) {
        await page.evaluate((id) => {
          const el = document.getElementById(id);
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const y = rect.top + window.scrollY - Math.max(0, (window.innerHeight - rect.height) / 2);
          window.scrollTo({ top: Math.max(0, y), behavior: "instant" });
        }, s.id);
        await page.waitForTimeout(600);
        const outFile = path.join(outDir, `${v.name}-${s.key}.png`);
        await page.screenshot({ path: outFile, fullPage: false });
      }
      for (const m of sectionMatchers) {
        await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const y = rect.top + window.scrollY - Math.max(0, (window.innerHeight - rect.height) / 2);
          window.scrollTo({ top: Math.max(0, y), behavior: "instant" });
        }, m.selector);
        await page.waitForTimeout(600);
        const outFile = path.join(outDir, `${v.name}-${m.key}.png`);
        await page.screenshot({ path: outFile, fullPage: false });
      }

      // Per-section box measurements — check for elements that overflow their parent horizontally
      const perElementOverflow = await page.evaluate(() => {
        const items = [];
        const check = (el, label) => {
          if (!el) return;
          const r = el.getBoundingClientRect();
          if (r.right > window.innerWidth + 1) {
            items.push(`${label}: right=${Math.round(r.right)} > vw=${window.innerWidth}`);
          }
          if (r.width > window.innerWidth + 1) {
            items.push(`${label}: width=${Math.round(r.width)} > vw=${window.innerWidth}`);
          }
        };
        document.querySelectorAll("h1,h2,h3").forEach((el) => {
          check(el, `${el.tagName.toLowerCase()}"${el.textContent.trim().slice(0, 32)}"`);
        });
        document.querySelectorAll(".ba-frame,.apply-grid,.scope-grid,.care-grid,.footer-grid,.aud-right,.faq-grid,.how-grid").forEach((el) => {
          const cls = Array.from(el.classList).join(".");
          check(el, `.${cls}`);
        });
        return items;
      });
      perElementOverflow.forEach((p) => problems.push(`[${v.name}] ${p}`));

      allErrors.push(...errors.map((e) => `[${v.name}] ${e}`));
      await ctx.close();
    }
  } finally {
    await browser.close();
  }

  console.log("\n=== Console errors ===");
  if (!allErrors.length) console.log("none");
  else allErrors.forEach((e) => console.log(" - " + e));

  console.log("\n=== Overflow / layout problems ===");
  if (!problems.length) console.log("none");
  else problems.forEach((p) => console.log(" - " + p));

  console.log("\nScreenshots written to:", outDir);
})();
