#!/usr/bin/env node
/**
 * Generate FirstNinety PWA icons at the three required sizes.
 *
 * Outputs:
 *   public/icons/icon-192.png         — 192x192, full-bleed wordmark
 *   public/icons/icon-512.png         — 512x512, full-bleed wordmark
 *   public/icons/icon-maskable-512.png — 512x512, wordmark inside the 80% safe zone
 *
 * The wordmark is "FirstNinety" set in Fraunces 600 on --ink (#0E1116) with
 * --paper (#FAF7F2) text, per Design Brief §9. Sharp rasterises an inline
 * SVG; the SVG font stack falls back to Georgia when Fraunces isn't on the
 * generating system. For a Fraunces-perfect icon, run this on a machine that
 * has the font installed, then commit the outputs.
 *
 * Run: `pnpm icons`
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

const INK = "#0E1116";
const PAPER = "#FAF7F2";
const FONT_STACK =
  "&apos;Fraunces&apos;, Georgia, &apos;Times New Roman&apos;, serif";

/**
 * Build a square SVG with the wordmark centred. `padding` reserves a safe
 * zone for maskable icons; the wordmark scales to fit the inner square.
 */
function wordmarkSvg({ size, padding = 0 }) {
  const inner = size - padding * 2;
  // Empirically tuned: Fraunces "FirstNinety" at 0.12 of width fits with
  // generous margin and is recognisable at 192px.
  const fontSize = Math.round(inner * 0.13);
  const cx = size / 2;
  const cy = size / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="${INK}"/>
  <text
    x="${cx}"
    y="${cy}"
    text-anchor="middle"
    dominant-baseline="central"
    font-family="${FONT_STACK}"
    font-weight="600"
    font-size="${fontSize}"
    fill="${PAPER}"
  >FirstNinety</text>
</svg>`;
}

const targets = [
  { name: "icon-192.png", size: 192, padding: 0 },
  { name: "icon-512.png", size: 512, padding: 0 },
  // Maskable safe zone is the inner 80% of the canvas (W3C spec) — that's a
  // 51px ring on each side at 512.
  { name: "icon-maskable-512.png", size: 512, padding: 51 },
];

for (const target of targets) {
  const svg = wordmarkSvg(target);
  const outPath = resolve(outDir, target.name);
  // density=300 forces a high-DPI rasterisation pass so text stays crisp.
  await sharp(Buffer.from(svg), { density: 300 })
    .resize(target.size, target.size)
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  console.log(`wrote ${outPath} (${target.size}x${target.size})`);
}
