#!/usr/bin/env node
/**
 * Render PNG favicons from app/icon.svg. Next.js App Router automatically
 * picks up app/icon.png, app/apple-icon.png, app/favicon.ico and emits the
 * proper <link> tags. No manual <head> wiring needed.
 */
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = join(__dirname, "..", "app");
const svg = readFileSync(join(appDir, "icon.svg"), "utf-8");

const outputs = [
  // Standard PNG fallback for older browsers and OG cards
  { name: "icon.png", size: 512 },
  // Apple touch icon (iOS home screen)
  { name: "apple-icon.png", size: 180 },
];

for (const { name, size } of outputs) {
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: size } });
  const png = resvg.render().asPng();
  writeFileSync(join(appDir, name), png);
  console.log(`✓ app/${name} (${size}×${size}, ${(png.length / 1024).toFixed(1)} KB)`);
}
