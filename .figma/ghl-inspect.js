const fs = require("node:fs");
const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((l) => {
    const i = l.indexOf("=");
    return [l.slice(0, i), l.slice(i + 1)];
  })
);
const KEY = env.GHL_PRIVATE_KEY;
const LOC = env.GHL_LOCATIONID;
const BASE = "https://services.leadconnectorhq.com";
const H = {
  Authorization: "Bearer " + KEY,
  Version: "2021-07-28",
  Accept: "application/json",
  "Content-Type": "application/json",
};

(async () => {
  // 1. List all custom fields for contact model
  const r = await fetch(`${BASE}/locations/${LOC}/customFields?model=contact`, { headers: H });
  const data = await r.json();
  const fields = data.customFields || [];
  console.log(`Total custom fields returned: ${fields.length}`);

  // Group by parentId to see folder structure
  const byParent = {};
  for (const f of fields) {
    const p = f.parentId || "(no folder)";
    if (!byParent[p]) byParent[p] = [];
    byParent[p].push(f);
  }
  console.log("\nDistinct parentIds:");
  for (const [pid, items] of Object.entries(byParent)) {
    console.log(`  ${pid} — ${items.length} field(s)`);
  }

  // 2. Try to fetch the folder list. Some GHL responses include documentType=folder entries.
  const folderEntries = fields.filter((f) => f.documentType === "folder");
  console.log(`\nFolder entries in customFields response: ${folderEntries.length}`);
  folderEntries.forEach((f) => console.log(`  ${f.id} — "${f.name}"`));

  // 3. Match candidate names for our Nanolix Free Website Program fields
  const wanted = [
    "Business name and website",
    "What does your business do",
    "City and country",
    "Your role",
    "Do you have a website now and what is wrong with it",
    "Do you have a logo, photos, and basic content ready",
    "The number one thing you want the site to do",
    "How soon do you need to launch",
    "Nanolix Free Website Program",
  ];
  console.log("\nExisting fields/folders matching Nanolix-related labels:");
  for (const name of wanted) {
    const hits = fields.filter((f) =>
      (f.name || "").toLowerCase().includes(name.toLowerCase().slice(0, 20))
    );
    if (hits.length) {
      hits.forEach((h) => console.log(`  "${name}" → ${h.documentType}: "${h.name}" id=${h.id} parent=${h.parentId || "-"} `));
    }
  }
})();
