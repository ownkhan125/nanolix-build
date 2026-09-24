const fs = require("node:fs");
const { chromium } = require("playwright");

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((l) => {
    const i = l.indexOf("=");
    return [l.slice(0, i), l.slice(i + 1)];
  })
);
const KEY = env.GHL_PRIVATE_KEY;
const LOC = env.GHL_LOCATIONID;
const H = {
  Authorization: "Bearer " + KEY,
  Version: "2021-07-28",
  Accept: "application/json",
  "Content-Type": "application/json",
};

const stamp = Date.now();
const TEST_EMAIL = `pw-fwp-${stamp}@nanolix.example`;
const TEST_DATA = {
  business:    `Playwright Test Co ${stamp}`,
  description: "Playwright end-to-end verification of the Free Website Program form.",
  city:        "Karachi, Pakistan",
  role:        "Founder",
  currentSite: "Old Wix, slow and hard to update",
  assets:      "Logo yes, some photos, no copy yet",
  goal:        "Get inbound leads for our consultancy",
  timeline:    "Two weeks",
};

// Field IDs written by ghl-setup.js
const mapping = JSON.parse(fs.readFileSync(".figma/ghl-field-mapping.json", "utf8"));

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
    await page.evaluate(() => document.getElementById("apply")?.scrollIntoView({ block: "start" }));
    await page.waitForTimeout(500);

    // Step 1
    await page.fill('#apply input[type="text"]', TEST_DATA.business);
    await page.fill('#apply input[type="email"]', TEST_EMAIL);
    await page.fill('#apply textarea', TEST_DATA.description);
    await page.click('#apply button:has-text("Continue")');
    await page.waitForTimeout(400);

    // Step 2
    const inputs = await page.$$('#apply input[type="text"]');
    if (inputs[0]) await inputs[0].fill(TEST_DATA.city);
    if (inputs[1]) await inputs[1].fill(TEST_DATA.role);
    const textareas = await page.$$('#apply textarea');
    if (textareas[0]) await textareas[0].fill(TEST_DATA.currentSite);
    if (textareas[1]) await textareas[1].fill(TEST_DATA.assets);
    if (inputs[2]) await inputs[2].fill(TEST_DATA.goal);
    if (inputs[3]) await inputs[3].fill(TEST_DATA.timeline);

    // Watch for the /api/apply response
    const apiPromise = page.waitForResponse((r) => r.url().includes("/api/apply") && r.request().method() === "POST");
    await page.click('#apply button:has-text("Submit my application")');
    const apiRes = await apiPromise;
    const apiStatus = apiRes.status();
    const apiJson = await apiRes.json().catch(() => ({}));
    results.push(`Form submit → /api/apply: ${apiStatus === 200 ? "OK" : "FAIL — " + apiStatus + " " + JSON.stringify(apiJson)}`);
    results.push(`  webhookOk=${apiJson.webhookOk} contactOk=${apiJson.contactOk} contactId=${apiJson.contactId}`);

    // Wait for success view
    await page.waitForTimeout(1000);
    const success = await page.textContent('#apply form h3').catch(() => null);
    results.push(`Success screen shows: ${success === "Application received" ? "OK" : "FAIL — " + success}`);

    await ctx.close();

    // Verify contact reached GHL with all custom fields
    if (apiJson.contactId) {
      const contactId = apiJson.contactId;
      const cr = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}`, { headers: H });
      const cj = await cr.json();
      const contact = cj.contact || {};
      const cfs = contact.customFields || [];
      const cfById = Object.fromEntries(cfs.map((f) => [f.id, f.value ?? f.field_value ?? null]));

      results.push(`GHL contact fetched: ${contact.id === contactId ? "OK" : "FAIL"}`);
      results.push(`  email=${contact.email} companyName=${contact.companyName}`);

      const expected = {
        business: TEST_DATA.business,
        description: TEST_DATA.description,
        city: TEST_DATA.city,
        role: TEST_DATA.role,
        currentSite: TEST_DATA.currentSite,
        assets: TEST_DATA.assets,
        goal: TEST_DATA.goal,
        timeline: TEST_DATA.timeline,
      };
      for (const [formKey, expectedVal] of Object.entries(expected)) {
        const cf = mapping.fields[formKey];
        const got = cfById[cf.id];
        const ok = got === expectedVal;
        results.push(`  "${cf.name}" (${cf.id}): ${ok ? "OK" : "FAIL — got=\"" + got + "\" expected=\"" + expectedVal + "\""}`);
      }
    } else {
      results.push("No contactId returned — cannot verify GHL contact.");
    }

    console.log(results.join("\n"));
    console.log(`\nConsole errors: ${errors.length}`);
    if (errors.length) errors.forEach((e) => console.log("  ERR:", e));
    const pass = results.filter((r) => r.includes(": OK")).length;
    const fail = results.filter((r) => r.includes("FAIL")).length;
    console.log(`\n${pass} OK, ${fail} FAIL`);
    console.log(`\nTest contact email: ${TEST_EMAIL}`);
    if (apiJson.contactId) console.log(`Test contact ID: ${apiJson.contactId}`);
  } finally {
    await browser.close();
  }
})();
