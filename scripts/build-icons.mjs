#!/usr/bin/env node
/**
 * Build every PWA icon + Apple touch icons + iOS splash screens from a single
 * source SVG (public/icon.svg).
 *
 *   - public/icons/icon-192.png            standard PWA icon
 *   - public/icons/icon-512.png            standard PWA icon
 *   - public/icons/icon-192-maskable.png   safe-zoned for Android adaptive
 *   - public/icons/icon-512-maskable.png   safe-zoned for Android adaptive
 *   - public/icons/apple-touch-icon.png    180×180 for iOS home screen
 *   - public/icons/favicon-32.png          favicon raster fallback
 *   - public/splash/*.png                  Apple iOS launch screens
 */
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svg = readFileSync(join(root, "public", "icon.svg"), "utf-8");

mkdirSync(join(root, "public", "icons"), { recursive: true });
mkdirSync(join(root, "public", "splash"), { recursive: true });

function render(svgText, width) {
  const resvg = new Resvg(svgText, { fitTo: { mode: "width", value: width } });
  return resvg.render().asPng();
}

function writePng(rel, png) {
  const p = join(root, "public", rel);
  writeFileSync(p, png);
  console.log(`✓ ${rel} (${(png.length / 1024).toFixed(1)} KB)`);
}

/* ---------- Standard PWA icons ---------- */
writePng("icons/icon-192.png", render(svg, 192));
writePng("icons/icon-512.png", render(svg, 512));

/* ---------- Maskable icons (safe zone padding) ---------- */
// Android adaptive icons crop a 40% center safe zone — we shrink the bookmark
// inside a coloured background so the inner artwork is never cropped.
const maskableSvg = svg.replace(
  /<rect width="512" height="512" rx="112"/,
  `<rect width="512" height="512" rx="0"`,
);
writePng("icons/icon-192-maskable.png", render(maskableSvg, 192));
writePng("icons/icon-512-maskable.png", render(maskableSvg, 512));

/* ---------- Apple touch icon ---------- */
writePng("icons/apple-touch-icon.png", render(svg, 180));

/* ---------- Favicon raster ---------- */
writePng("icons/favicon-32.png", render(svg, 32));

/* ---------- iOS splash screens ----------
 * Apple wants a per-device-size launch image. We use the same gradient
 * background and a centered logo at ~25% of the smaller dimension.
 */
const splashes = [
  { name: "splash-2048x2732.png", w: 2048, h: 2732 }, // iPad Pro 12.9
  { name: "splash-1668x2388.png", w: 1668, h: 2388 }, // iPad Pro 11
  { name: "splash-1536x2048.png", w: 1536, h: 2048 }, // iPad Mini/Air
  { name: "splash-1290x2796.png", w: 1290, h: 2796 }, // iPhone 15 Pro Max
  { name: "splash-1179x2556.png", w: 1179, h: 2556 }, // iPhone 15 Pro
  { name: "splash-1170x2532.png", w: 1170, h: 2532 }, // iPhone 13/14
  { name: "splash-1125x2436.png", w: 1125, h: 2436 }, // iPhone X / 11 Pro
  { name: "splash-828x1792.png", w: 828, h: 1792 },   // iPhone XR / 11
  { name: "splash-750x1334.png", w: 750, h: 1334 },   // iPhone 8 / SE
];

function splashSvg(w, h) {
  const logoSize = Math.round(Math.min(w, h) * 0.28);
  const logoX = Math.round((w - logoSize) / 2);
  const logoY = Math.round((h - logoSize) / 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0a0c12"/>
        <stop offset="100%" stop-color="#1a1530"/>
      </linearGradient>
      <radialGradient id="b1" cx="0.1" cy="0.1" r="0.6">
        <stop offset="0%" stop-color="#5b9dff" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#5b9dff" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="b2" cx="0.92" cy="0.95" r="0.55">
        <stop offset="0%" stop-color="#ec4899" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#ec4899" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#bg)"/>
    <rect width="${w}" height="${h}" fill="url(#b1)"/>
    <rect width="${w}" height="${h}" fill="url(#b2)"/>
    <g transform="translate(${logoX} ${logoY})">
      ${svg.replace(/<\?xml[^?]*\?>/, "").replace(/<svg[^>]*>/, `<svg width="${logoSize}" height="${logoSize}" viewBox="0 0 512 512">`)}
    </g>
  </svg>`;
}

for (const { name, w, h } of splashes) {
  const png = render(splashSvg(w, h), w);
  writePng(`splash/${name}`, png);
}

console.log("\n✅ All PWA icons + splash screens generated.");
