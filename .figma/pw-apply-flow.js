const { chromium } = require("playwright");

const url = process.env.TARGET_URL || "http://localhost:3001/";

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
    await page.waitForTimeout(400);

    await page.evaluate(() => document.getElementById("apply")?.scrollIntoView({ block: "start" }));
    await page.waitForTimeout(500);

    // 1. Step 1 visible with 3 fields and disabled-looking progress bar 2 & 3
    const step1 = await page.evaluate(() => {
      const h3 = document.querySelector("#apply form h3");
      const inputs = document.querySelectorAll("#apply form input, #apply form textarea");
      const bars = Array.from(document.querySelectorAll("#apply form > div > span")).map(
        (s) => getComputedStyle(s).backgroundImage !== "none" || getComputedStyle(s).backgroundColor
      );
      return { title: h3?.textContent, fieldCount: inputs.length, barsFilled: bars };
    });
    results.push(`Step 1 title: ${step1.title === "Step 1: The quick part" ? "OK" : "FAIL — " + step1.title}`);
    results.push(`Step 1 fields (3 expected): ${step1.fieldCount === 3 ? "OK" : "FAIL — " + step1.fieldCount}`);

    // 2. Click Continue with empty fields → error line appears
    await page.click('#apply button[type="submit"]');
    await page.waitForTimeout(300);
    const err = await page.textContent('#apply [role="alert"]').catch(() => null);
    results.push(`Empty submit shows validation error: ${err && err.includes("business name") ? "OK" : "FAIL — " + err}`);

    // 3. Fill in valid data, click Continue → advance to Step 2
    await page.fill('#apply input[type="text"]', "Acme Co");
    await page.fill('#apply input[type="email"]', "test@example.com");
    await page.fill('#apply textarea', "We make awesome things.");
    await page.click('#apply button[type="submit"]');
    await page.waitForTimeout(500);
    const step2Title = await page.textContent('#apply form h3').catch(() => null);
    const step2FieldCount = await page.evaluate(() => document.querySelectorAll("#apply form input, #apply form textarea").length);
    results.push(`Step 2 title: ${step2Title === "Step 2: The details" ? "OK" : "FAIL — " + step2Title}`);
    results.push(`Step 2 fields (6 expected): ${step2FieldCount === 6 ? "OK" : "FAIL — " + step2FieldCount}`);

    // 4. Back link returns to step 1 and preserves data
    await page.click('#apply button:has-text("Back to the quick part")');
    await page.waitForTimeout(300);
    const backTitle = await page.textContent('#apply form h3');
    const businessKept = await page.$eval('#apply input[type="text"]', (el) => el.value);
    results.push(`Back → Step 1: ${backTitle === "Step 1: The quick part" ? "OK" : "FAIL — " + backTitle}`);
    results.push(`Step 1 data preserved: ${businessKept === "Acme Co" ? "OK" : "FAIL — " + businessKept}`);

    // 5. Continue again then submit Step 2 → Step 3 success + Calendly inline widget
    await page.click('#apply button[type="submit"]');
    await page.waitForTimeout(300);
    // Fill some step 2 fields
    const inputs2 = await page.$$('#apply input[type="text"]');
    if (inputs2[0]) await inputs2[0].fill("Karachi, Pakistan");
    if (inputs2[1]) await inputs2[1].fill("Founder");
    if (inputs2[2]) await inputs2[2].fill("Grow sales");
    if (inputs2[3]) await inputs2[3].fill("2 weeks");
    // Submit
    await page.click('#apply button:has-text("Submit my application")');
    await page.waitForTimeout(1200);

    const successTitle = await page.textContent('#apply form h3');
    results.push(`Step 3 title: ${successTitle === "Application received" ? "OK" : "FAIL — " + successTitle}`);

    // Verify Calendly inline iframe/widget attached in the aside
    const calendarLoaded = await page.evaluate(() => {
      const aside = document.querySelector("#apply aside");
      if (!aside) return false;
      // Calendly inline widget attaches an iframe inside the target container.
      return !!aside.querySelector('iframe, .calendly-inline-widget, .calendly-spinner');
    });
    results.push(`Step 3 aside loads calendar: ${calendarLoaded ? "OK" : "FAIL"}`);

    // Verify all 3 progress bars are filled at step 3
    const barsFilled = await page.evaluate(() => {
      const bars = Array.from(document.querySelectorAll("#apply form > div:first-child > span"));
      return bars.map((b) => getComputedStyle(b).backgroundImage.includes("gradient"));
    });
    const allFilled = barsFilled.length === 3 && barsFilled.every(Boolean);
    results.push(`All 3 progress bars filled at Step 3: ${allFilled ? "OK" : "FAIL — " + JSON.stringify(barsFilled)}`);

    await ctx.close();

    console.log(results.join("\n"));
    console.log("\nConsole errors:", errors.length);
    if (errors.length) errors.forEach((e) => console.log("  ERR:", e));
    const pass = results.filter((r) => r.includes(": OK")).length;
    console.log(`\n${pass}/${results.length} checks passed.`);
  } finally {
    await browser.close();
  }
})();
