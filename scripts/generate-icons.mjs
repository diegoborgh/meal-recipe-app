/**
 * Generate PNG icons for the PWA manifest from the master SVGs in public/icons/.
 * Run via `npm run gen:icons` after editing icon.svg / icon-maskable.svg.
 *
 * Outputs:
 *   public/icons/icon-192.png            (manifest, "any")
 *   public/icons/icon-512.png            (manifest, "any")
 *   public/icons/icon-maskable-512.png   (manifest, "maskable")
 *   public/icons/apple-touch-icon.png    (iOS home screen, 180×180)
 *
 * Sharp is the conversion engine. It's a devDep — never imported by app code.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const iconsDir = resolve(root, 'public/icons');

/** @type {{ src: string; out: string; size: number }[]} */
const TARGETS = [
  { src: 'icon.svg',          out: 'icon-192.png',          size: 192 },
  { src: 'icon.svg',          out: 'icon-512.png',          size: 512 },
  { src: 'icon-maskable.svg', out: 'icon-maskable-512.png', size: 512 },
  { src: 'icon.svg',          out: 'apple-touch-icon.png',  size: 180 },
];

async function main() {
  for (const { src, out, size } of TARGETS) {
    const svg = await readFile(resolve(iconsDir, src));
    const png = await sharp(svg, { density: 384 }) // crisp rasterization for SVG
      .resize(size, size, { fit: 'contain' })
      .png({ compressionLevel: 9 })
      .toBuffer();
    await writeFile(resolve(iconsDir, out), png);
    console.log(`✓ ${out} (${size}×${size})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
