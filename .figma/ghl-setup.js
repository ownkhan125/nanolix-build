// One-time setup script — creates the "Nanolix Free Website Program" folder
// and 8 custom fields under it. Idempotent: checks each entity before creating.
const fs = require("node:fs");
const path = require("node:path");

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

const FOLDER_NAME = "Nanolix Free Website Program";

// Form fields → GHL custom fields. Names use the exact form-question wording.
// `payloadKey` is the JSON key the website will send; `dataType` is the GHL type.
const FIELDS = [
  { formKey: "business",    name: "Business name and website if you have one",     dataType: "TEXT",       position: 100 },
  { formKey: "description", name: "What does your business do, in one sentence?",  dataType: "LARGE_TEXT", position: 200 },
  { formKey: "city",        name: "City and country",                              dataType: "TEXT",       position: 300 },
  { formKey: "role",        name: "Your role",                                     dataType: "TEXT",       position: 400 },
  { formKey: "currentSite", name: "Do you have a website now and what is wrong with it?", dataType: "LARGE_TEXT", position: 500 },
  { formKey: "assets",      name: "Do you have a logo, photos, and basic content ready?", dataType: "LARGE_TEXT", position: 600 },
  { formKey: "goal",        name: "The number one thing you want the site to do",  dataType: "TEXT",       position: 700 },
  { formKey: "timeline",    name: "How soon do you need to launch?",               dataType: "TEXT",       position: 800 },
];

async function listAllFields() {
  const r = await fetch(`${BASE}/locations/${LOC}/customFields?model=contact`, { headers: H });
  if (!r.ok) throw new Error(`list fields ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return j.customFields || [];
}

async function findFolderId(name) {
  // GHL doesn't expose a list-folders endpoint; iterate parentIds seen on fields.
  const fields = await listAllFields();
  const parentIds = [...new Set(fields.map((f) => f.parentId).filter(Boolean))];
  for (const pid of parentIds) {
    const r = await fetch(`${BASE}/locations/${LOC}/customFields/${pid}`, { headers: H });
    if (!r.ok) continue;
    const j = await r.json();
    const cf = j.customField;
    if (cf?.documentType === "folder" && cf.name === name) return cf.id;
  }
  return null;
}

async function createFolder(name) {
  // Folders are created by POSTing to the customFields endpoint with
  // documentType="folder". Response wraps the entity as customFieldFolder.
  const r = await fetch(`${BASE}/locations/${LOC}/customFields`, {
    method: "POST",
    headers: H,
    body: JSON.stringify({
      name,
      documentType: "folder",
      model: "contact",
      position: 900,
    }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`create folder ${r.status}: ${text}`);
  const j = JSON.parse(text);
  return j.customFieldFolder?.id || j.customField?.id || j.id;
}

async function findFieldInFolder(name, parentId, allFields) {
  return allFields.find((f) => f.name === name && f.parentId === parentId) || null;
}

async function createField({ name, dataType, position, parentId }) {
  const body = {
    name,
    dataType,
    placeholder: "",
    position,
    model: "contact",
    locationId: LOC,
    parentId,
    isMultipleFile: false,
  };
  const r = await fetch(`${BASE}/locations/${LOC}/customFields`, {
    method: "POST",
    headers: H,
    body: JSON.stringify(body),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`create field "${name}" ${r.status}: ${text}`);
  const j = JSON.parse(text);
  return j.customField || j;
}

(async () => {
  console.log("→ Looking for existing folder:", FOLDER_NAME);
  let folderId = await findFolderId(FOLDER_NAME);
  if (folderId) {
    console.log(`  Found existing folder: ${folderId}`);
  } else {
    console.log("  Not found — creating");
    folderId = await createFolder(FOLDER_NAME);
    console.log(`  Created folder: ${folderId}`);
  }

  const allFields = await listAllFields();
  const mapping = { folderId, folderName: FOLDER_NAME, fields: {} };

  for (const spec of FIELDS) {
    const existing = await findFieldInFolder(spec.name, folderId, allFields);
    let cf;
    if (existing) {
      console.log(`  = Field exists: "${spec.name}" → ${existing.id} (${existing.fieldKey})`);
      cf = existing;
    } else {
      cf = await createField({ ...spec, parentId: folderId });
      console.log(`  + Created field: "${spec.name}" → ${cf.id} (${cf.fieldKey})`);
    }
    mapping.fields[spec.formKey] = {
      id: cf.id,
      name: spec.name,
      fieldKey: cf.fieldKey,
      dataType: spec.dataType,
    };
  }

  fs.writeFileSync(
    path.resolve(".figma/ghl-field-mapping.json"),
    JSON.stringify(mapping, null, 2)
  );
  console.log("\nMapping written to .figma/ghl-field-mapping.json");
  console.log(JSON.stringify(mapping, null, 2));
})().catch((e) => { console.error(e); process.exit(1); });
