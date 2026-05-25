#!/usr/bin/env node
/**
 * Extracts the rendered HTML template from each design-prototype HTML
 * file and writes it to docs/design-prototypes/_rendered/<slug>.html.
 *
 * Each prototype is a single-page bundle: an SVG thumbnail visible
 * immediately + a `<script type="__bundler/template">` block holding
 * the JSON-encoded real HTML/CSS that the page JS unpacks at runtime.
 * This script decodes that template so we can read the actual design
 * without firing up a browser.
 *
 * Run: `pnpm prototypes:extract`
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const protoDir = resolve(repoRoot, "docs/design-prototypes");
const outDir = resolve(protoDir, "_rendered");
mkdirSync(outDir, { recursive: true });

const TEMPLATE_RE = /<script type="__bundler\/template">\s*([\s\S]+?)\s*<\/script>/;

function slugify(name) {
  return name
    .replace(/\.html?$/i, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

const entries = readdirSync(protoDir).filter((n) => /\.html?$/i.test(n));
let extracted = 0;
let skipped = 0;

for (const filename of entries) {
  const full = join(protoDir, filename);
  const text = readFileSync(full, "utf8");
  const match = TEMPLATE_RE.exec(text);
  if (!match) {
    skipped += 1;
    console.warn(`[skip] ${filename}: no template block`);
    continue;
  }
  let rendered;
  try {
    rendered = JSON.parse(match[1]);
  } catch (err) {
    skipped += 1;
    console.warn(`[skip] ${filename}: JSON parse failed (${(err && err.message) || err})`);
    continue;
  }
  if (typeof rendered !== "string") {
    skipped += 1;
    console.warn(`[skip] ${filename}: template is not a string`);
    continue;
  }
  const outPath = join(outDir, `${slugify(filename)}.html`);
  writeFileSync(outPath, rendered, "utf8");
  extracted += 1;
}

console.log(`Extracted ${extracted} prototype(s), skipped ${skipped}. Output: ${outDir}`);
