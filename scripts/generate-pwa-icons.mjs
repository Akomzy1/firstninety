#!/usr/bin/env node
/**
 * Generate FirstNinety PWA icons at the three required sizes.
 *
 * Outputs:
 *   public/icons/icon-192.png         — 192x192, full-bleed First90 wordmark
 *   public/icons/icon-512.png         — 512x512, full-bleed
 *   public/icons/icon-maskable-512.png — 512x512, inside the 80% safe zone
 *
 * Wordmark per the prototypes: italic "First" + numeric "90" set in
 * Fraunces, on --ink ground, with a coral dot accent floating to the
 * upper right of "90". Sharp rasterises the SVG; the SVG font stack
 * falls back to Georgia when Fraunces isn't installed on the generating
 * machine.
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
const ACCENT = "#D9532C";
const FONT_STACK = "'Fraunces', Georgia, 'Times New Roman', serif";

function wordmarkSvg({ size, padding = 0 }) {
  const inner = size - padding * 2;
  // Empirically tuned: "First90" sits well at ~0.27 of the inner width.
  const fontSize = Math.round(inner * 0.27);
  const cx = size / 2;
  const cy = size / 2;
  // The accent dot floats to the upper-right of the text. Roughly half the
  // text width to the right of the centre, then up by ~0.55 em.
  const accentOffsetX = fontSize * 1.45;
  const accentOffsetY = fontSize * 0.55;
  const accentR = Math.max(3, Math.round(fontSize * 0.09));

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
  ><tspan font-style="italic" font-weight="400">First</tspan>90</text>
  <circle cx="${cx + accentOffsetX}" cy="${cy - accentOffsetY}" r="${accentR}" fill="${ACCENT}"/>
</svg>`;
}

const targets = [
  { name: "icon-192.png", size: 192, padding: 0 },
  { name: "icon-512.png", size: 512, padding: 0 },
  // Maskable safe zone — inner 80% of the canvas per W3C spec.
  { name: "icon-maskable-512.png", size: 512, padding: 51 },
];

for (const target of targets) {
  const svg = wordmarkSvg(target);
  const outPath = resolve(outDir, target.name);
  await sharp(Buffer.from(svg), { density: 300 })
    .resize(target.size, target.size)
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  console.log(`wrote ${outPath} (${target.size}x${target.size})`);
}
