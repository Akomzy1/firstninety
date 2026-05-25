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
  // "First • 90" lockup with the coral dot AS the separator between First
  // and 90 (per the Marketing Landing prototype). The text alignment +
  // accent positioning are tuned empirically against the rendered output.
  const fontSize = Math.round(inner * 0.27);
  const cx = size / 2;
  const cy = size / 2;
  // The accent dot sits on the lowercase x-height baseline between the
  // two text runs. Tspan dx pushes "90" to the right of the dot.
  const accentR = Math.max(3, Math.round(fontSize * 0.08));
  // Centre-shift approximate: the "First •" group is wider than "90"; we
  // anchor the lockup at the visual centre by leaning slightly left.
  const accentDx = fontSize * 0.18;
  const ninetyDx = fontSize * 0.32;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="${INK}"/>
  <g transform="translate(${cx} ${cy})" text-anchor="middle" dominant-baseline="central">
    <text
      font-family="${FONT_STACK}"
      font-weight="600"
      font-size="${fontSize}"
      fill="${PAPER}"
    ><tspan font-style="italic" font-weight="400">First</tspan><tspan dx="${ninetyDx}">90</tspan></text>
    <circle cx="${accentDx}" cy="0" r="${accentR}" fill="${ACCENT}"/>
  </g>
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
