const { chromium } = require("playwright");

const url = process.env.TARGET_URL || "http://localhost:3001/";

const expectedAudienceHeadings = [
  "Give the label a home it can grow into.",
  "The shop online should feel like the shop on the street.",
  "Every piece is deliberate. The website should be too.",
  "The consultation starts before they call.",
  "The product is ready. The shelf is not enough.",
  "Your product is serious. Make the website match.",
  "Look like the business you already are.",
];

const expectedClosest = [
  "Bioflex Aesthetics",
  "House Pickleball",
  "ZAKA",
  "Bioflex Aesthetics",
  "House Pickleball",
  "ZAKA",
  "NUST",
];

const expectedFaqSnippets = [
  "There is no upfront design fee.",
  "The commitment is the care plan.",
  "Yes. It is yours",
  "Cancel within the first 30 days",
  "The care plan includes managed hosting",
  "Typically one to two weeks",
  "We take a limited number of builds",
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  const errors = [];

  try {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    await page.goto(url, { waitUntil: "networkidle" });

    // Click through every audience chip; verify heading + closest delivered work change.
    await page.evaluate(() => document.getElementById("audience")?.scrollIntoView({ block: "start" }));
    await page.waitForTimeout(500);
    const chips = await page.$$('#audience li button');
    for (let i = 0; i < expectedAudienceHeadings.length; i++) {
      if (!chips[i]) { results.push(`audience[${i}]: chip not found`); continue; }
      await chips[i].click();
      await page.waitForTimeout(250);
      const state = await page.evaluate(() => {
        const h3 = document.querySelector("#audience .aud-content h3");
        const closestBlock = document.querySelector("#audience .aud-side .text-metallic");
        return {
          heading: h3 ? h3.textContent.trim() : null,
          closest: closestBlock ? closestBlock.textContent.trim() : null,
        };
      });
      const passHead = state.heading === expectedAudienceHeadings[i];
      const passClosest = state.closest === expectedClosest[i];
      results.push(`audience[${i}] heading: ${passHead ? "OK" : "FAIL — " + state.heading} | closest: ${passClosest ? "OK" : "FAIL — " + state.closest}`);
    }

    // Verify FAQ answers appear when a row is opened.
    await page.evaluate(() => document.getElementById("faq")?.scrollIntoView({ block: "start" }));
    await page.waitForTimeout(400);
    const faqButtons = await page.$$('#faq button[aria-expanded]');
    for (let i = 0; i < expectedFaqSnippets.length; i++) {
      if (!faqButtons[i]) { results.push(`faq[${i}]: button not found`); continue; }
      await faqButtons[i].click();
      await page.waitForTimeout(200);
      const shown = await page.evaluate((snippet) => {
        return document.querySelector("#faq")?.textContent?.includes(snippet) || false;
      }, expectedFaqSnippets[i]);
      results.push(`faq[${i}] "${expectedFaqSnippets[i].slice(0, 24)}...": ${shown ? "OK" : "FAIL"}`);
      // Close before opening next so each open state is independently tested.
      await faqButtons[i].click();
      await page.waitForTimeout(100);
    }

    await ctx.close();
  } finally {
    await browser.close();
  }

  console.log(results.join("\n"));
  console.log(`\nConsole errors: ${errors.length}`);
  if (errors.length) errors.forEach((e) => console.log("  ERR:", e));
  const failed = results.filter((r) => r.includes("FAIL")).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed.`);
})();
