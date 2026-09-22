const { chromium } = require("playwright");

const url = process.env.TARGET_URL || "http://localhost:3001/";

const sections = [
  { id: "audience", label: "Who it" },
  { id: "scope",    label: "What" },
  { id: "pricing",  label: "Pricing" },
  { id: "faq",      label: "Questions" },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const v of [
      { name: "desktop", width: 1440, height: 900 },
      { name: "mobile",  width: 375,  height: 812 },
    ]) {
      const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height } });
      const page = await ctx.newPage();
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForTimeout(400);

      // Mobile: open the burger menu to expose nav links
      if (v.width < 768) {
        const burger = await page.$('button[aria-label="Toggle menu"]');
        if (burger) { await burger.click(); await page.waitForTimeout(200); }
      }

      for (const s of sections) {
        // Close menu (mobile) before scrolling so section is measurable
        if (v.width < 768) {
          const burger = await page.$('button[aria-label="Toggle menu"]');
          if (burger) { await burger.click(); await page.waitForTimeout(150); }
        }
        // Scroll section into view + a bit past top so it enters the "active band"
        await page.evaluate((id) => {
          const el = document.getElementById(id);
          if (!el) return;
          const y = el.getBoundingClientRect().top + window.scrollY - 60;
          window.scrollTo({ top: y, behavior: "instant" });
        }, s.id);
        await page.waitForTimeout(500);

        // Mobile: re-open menu to check the link state
        if (v.width < 768) {
          const burger = await page.$('button[aria-label="Toggle menu"]');
          if (burger) { await burger.click(); await page.waitForTimeout(200); }
        }

        const state = await page.evaluate((href) => {
          const link = document.querySelector(`header a[href="${href}"]`);
          if (!link) return { found: false };
          const st = getComputedStyle(link);
          return {
            found: true,
            color: st.color,
            ariaCurrent: link.getAttribute("aria-current"),
          };
        }, `#${s.id}`);

        const isActive = state.ariaCurrent === "true" && state.color.replace(/\s/g, "") === "rgb(255,255,255)";
        results.push(`[${v.name}] #${s.id}: ariaCurrent=${state.ariaCurrent} color=${state.color} → ${isActive ? "ACTIVE ✓" : "not active ✗"}`);
      }

      await ctx.close();
    }
  } finally {
    await browser.close();
  }

  console.log(results.join("\n"));
  const pass = results.filter((r) => r.includes("ACTIVE ✓")).length;
  const total = results.length;
  console.log(`\n${pass}/${total} sections correctly activated the matching nav link.`);
})();
