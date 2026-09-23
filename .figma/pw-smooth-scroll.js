const { chromium } = require("playwright");

const url = process.env.TARGET_URL || "http://localhost:3001/";

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet",  width: 900,  height: 1024 },
  { name: "mobile",  width: 390,  height: 844 },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  const allErrors = [];

  try {
    for (const v of viewports) {
      const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height } });
      const page = await ctx.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);

      // 1. Confirm Lenis has attached (adds class `lenis lenis-smooth` to html).
      const lenisAttached = await page.evaluate(() =>
        document.documentElement.classList.contains("lenis") ||
        document.documentElement.classList.contains("lenis-smooth")
      );

      // 2. Confirm ScrollTrigger has registered triggers for non-hero sections.
      const triggerCount = await page.evaluate(() => {
        const st = window.ScrollTrigger || (window.gsap && window.gsap.ScrollTrigger);
        if (!st?.getAll) return -1;
        return st.getAll().length;
      });

      // 3. Verify heading masks were injected (data-reveal-applied on all reveal headings).
      const headings = await page.evaluate(() => {
        const els = Array.from(document.querySelectorAll("[data-reveal-heading]"));
        return {
          total: els.length,
          applied: els.filter((e) => e.dataset.revealApplied === "true").length,
          masks: els.reduce((sum, e) => sum + e.querySelectorAll(".mr-mask").length, 0),
        };
      });

      // 4. Simulate scroll — anchor click should smooth-scroll, not jump.
      const scrollBefore = await page.evaluate(() => window.scrollY);
      if (v.width < 768) {
        await page.click('button[aria-label="Toggle menu"]');
        await page.waitForTimeout(200);
      }
      // Pick the first *visible* pricing anchor (desktop nav is display:none on mobile).
      const anchor = await page.evaluateHandle(() => {
        const links = Array.from(document.querySelectorAll('header a[href="#pricing"]'));
        return links.find((a) => a.offsetParent !== null) || null;
      });
      await anchor.asElement()?.click();
      await page.waitForTimeout(1400);
      const scrollAfter = await page.evaluate(() => window.scrollY);
      const pricingY = await page.evaluate(() => document.getElementById("pricing").getBoundingClientRect().top + window.scrollY);
      const landedNearPricing = Math.abs(scrollAfter - (pricingY - 53)) < 20;

      // 5. Sample scrollY over ~1s while a fresh anchor click is animating to
      //    confirm Lenis is easing (many intermediate values), not jumping.
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      // Fire a scroll to #faq and sample.
      const smoothness = await page.evaluate(async () => {
        const link = Array.from(document.querySelectorAll('header a[href="#faq"]'))
          .find((a) => a.offsetParent !== null);
        if (!link) return { samples: 0, unique: 0 };
        link.click();
        const samples = [];
        for (let i = 0; i < 30; i++) {
          samples.push(window.scrollY);
          await new Promise((r) => setTimeout(r, 40));
        }
        const unique = new Set(samples).size;
        return { samples: samples.length, unique, first: samples[0], last: samples[samples.length - 1] };
      });

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth - document.documentElement.clientWidth;
      });

      results.push(
        `[${v.name}] lenis=${lenisAttached ? "OK" : "FAIL"} headings=${headings.applied}/${headings.total} (${headings.masks} word masks) anchorScroll=${landedNearPricing ? "OK" : "FAIL (from " + scrollBefore + " → " + scrollAfter + ", target " + (pricingY - 53) + ")"} smoothness=${smoothness.unique}/${smoothness.samples} unique frames (${smoothness.first}→${smoothness.last}) hOverflow=${overflow}px`
      );
      allErrors.push(...errors.map((e) => `[${v.name}] ${e}`));
      await ctx.close();
    }
  } finally {
    await browser.close();
  }

  console.log(results.join("\n"));
  console.log("\nConsole errors:", allErrors.length);
  if (allErrors.length) allErrors.forEach((e) => console.log("  ERR:", e));
})();
