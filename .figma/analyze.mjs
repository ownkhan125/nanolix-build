import fs from "node:fs";

const raw = JSON.parse(fs.readFileSync(".figma/node-4-1438.json", "utf8"));
const rootWrap = raw.nodes["4:1438"];
const root = rootWrap.document;

function box(n) {
  const b = n.absoluteBoundingBox;
  return b ? `${b.x.toFixed(0)},${b.y.toFixed(0)} ${b.width.toFixed(0)}x${b.height.toFixed(0)}` : "";
}

function summarize(n, depth = 0, max = 2) {
  const pad = "  ".repeat(depth);
  const line = `${pad}- ${n.type} "${n.name}" [${box(n)}] id=${n.id}`;
  console.log(line);
  if (depth >= max) return;
  const kids = n.children || [];
  for (const k of kids) summarize(k, depth + 1, max);
}

console.log("ROOT:", root.type, root.name, "size:", box(root));
console.log("---");
summarize(root, 0, 2);
