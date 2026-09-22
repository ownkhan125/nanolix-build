import fs from "node:fs";
import path from "node:path";

const raw = JSON.parse(fs.readFileSync(".figma/node-4-1438.json", "utf8"));
const rootWrap = raw.nodes["4:1438"];
const root = rootWrap.document;

const OUT_DIR = ".figma/sections";
fs.mkdirSync(OUT_DIR, { recursive: true });

function rgbaToCss(c) {
  if (!c) return "";
  const r = Math.round(c.r * 255);
  const g = Math.round(c.g * 255);
  const b = Math.round(c.b * 255);
  const a = c.a ?? 1;
  return a === 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${+a.toFixed(3)})`;
}

function summarizeFills(fills) {
  if (!fills || !fills.length) return "";
  return fills
    .map((f) => {
      if (f.type === "SOLID") return `SOLID ${rgbaToCss(f.color)}`;
      if (f.type === "IMAGE") return `IMAGE ref=${f.imageRef} scale=${f.scaleMode}`;
      if (f.type?.startsWith("GRADIENT")) {
        const stops = (f.gradientStops || [])
          .map((s) => `${(s.position * 100).toFixed(0)}%:${rgbaToCss(s.color)}`)
          .join(" ");
        return `${f.type} ${stops}`;
      }
      return f.type;
    })
    .join(" | ");
}

function summarizeStroke(n) {
  if (!n.strokes || !n.strokes.length) return "";
  const w = n.strokeWeight;
  return `STROKE ${summarizeFills(n.strokes)} w=${w}`;
}

function summarizeStyle(n) {
  const s = n.style;
  if (!s) return "";
  return `font=${s.fontFamily || ""} ${s.fontWeight || ""} ${s.fontSize || ""}/${(s.lineHeightPx || "").toString().slice(0, 6)} tracking=${s.letterSpacing?.toFixed?.(2) ?? ""} align=${s.textAlignHorizontal || ""}`;
}

function box(n) {
  const b = n.absoluteBoundingBox;
  if (!b) return "";
  return `${b.x.toFixed(0)},${b.y.toFixed(0)} ${b.width.toFixed(0)}x${b.height.toFixed(0)}`;
}

function layout(n) {
  const parts = [];
  if (n.layoutMode) parts.push(`layout=${n.layoutMode}`);
  if (n.primaryAxisAlignItems) parts.push(`primary=${n.primaryAxisAlignItems}`);
  if (n.counterAxisAlignItems) parts.push(`counter=${n.counterAxisAlignItems}`);
  if (n.itemSpacing != null) parts.push(`gap=${n.itemSpacing}`);
  if (n.paddingLeft != null || n.paddingRight != null || n.paddingTop != null || n.paddingBottom != null) {
    parts.push(`pad=${n.paddingTop || 0}/${n.paddingRight || 0}/${n.paddingBottom || 0}/${n.paddingLeft || 0}`);
  }
  if (n.cornerRadius != null) parts.push(`radius=${n.cornerRadius}`);
  if (Array.isArray(n.rectangleCornerRadii)) parts.push(`radii=${n.rectangleCornerRadii.join("/")}`);
  return parts.join(" ");
}

function line(n, depth) {
  const pad = "  ".repeat(depth);
  const parts = [`${pad}- ${n.type} "${n.name}" [${box(n)}] id=${n.id}`];
  const l = layout(n);
  if (l) parts.push(`${pad}    ${l}`);
  const f = summarizeFills(n.fills);
  if (f) parts.push(`${pad}    fills: ${f}`);
  const st = summarizeStroke(n);
  if (st) parts.push(`${pad}    ${st}`);
  const sy = summarizeStyle(n);
  if (sy) parts.push(`${pad}    ${sy}`);
  if (n.type === "TEXT" && n.characters) {
    const c = n.characters.replace(/\n/g, "\\n");
    parts.push(`${pad}    text: ${JSON.stringify(c)}`);
  }
  return parts.join("\n");
}

function dump(n, depth, out) {
  out.push(line(n, depth));
  const kids = n.children || [];
  for (const k of kids) dump(k, depth + 1, out);
}

function slugify(s) {
  return s.replace(/[^\w-]+/g, "_").slice(0, 60);
}

// Dump each top-level section (Header, Main children, Footer)
const targets = [];
// Header
const header = root.children.find((c) => c.name === "Header - HEADER");
if (header) targets.push(header);
// Main children
const main = root.children.find((c) => c.name === "Main");
if (main) targets.push(...main.children);
// Footer
const footer = root.children.find((c) => c.name.startsWith("FOOTER"));
if (footer) targets.push(footer);

for (const t of targets) {
  const out = [];
  dump(t, 0, out);
  const fname = `${slugify(t.id)}_${slugify(t.name)}.txt`;
  fs.writeFileSync(path.join(OUT_DIR, fname), out.join("\n"));
  console.log(`wrote ${fname}  (lines=${out.length})`);
}

// Also emit a global tokens summary: unique colors, unique fonts, image refs
const colors = new Set();
const fonts = new Map();
const imageRefs = new Set();

function walk(n) {
  for (const f of n.fills || []) {
    if (f.type === "SOLID") colors.add(rgbaToCss(f.color));
    if (f.type === "IMAGE") imageRefs.add(f.imageRef);
  }
  for (const s of n.strokes || []) {
    if (s.type === "SOLID") colors.add(rgbaToCss(s.color));
  }
  if (n.style) {
    const k = `${n.style.fontFamily} ${n.style.fontWeight} ${n.style.fontSize}/${n.style.lineHeightPx}`;
    fonts.set(k, (fonts.get(k) || 0) + 1);
  }
  for (const c of n.children || []) walk(c);
}
walk(root);
fs.writeFileSync(
  ".figma/tokens.txt",
  [
    "=== COLORS ===",
    [...colors].sort().join("\n"),
    "",
    "=== FONTS (usage-count desc) ===",
    [...fonts.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${v}x  ${k}`).join("\n"),
    "",
    "=== IMAGE REFS ===",
    [...imageRefs].join("\n"),
  ].join("\n"),
);
console.log("wrote tokens.txt");
