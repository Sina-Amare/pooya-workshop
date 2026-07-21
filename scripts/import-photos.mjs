// One-off import: converts the owner's PNG photos in the project root into
// optimized WebP files under public/works/ and emits src/lib/seed-images.json
// with dimensions and blur placeholders for use in seed content.
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, "public", "works-photos");
await fs.mkdir(outDir, { recursive: true });

// source file -> clean output name
const MAP = {
  "IMG_4619.PNG": "kitchen-modern-island",
  "IMG_4620.PNG": "kitchen-white-oak-frame",
  "IMG_4621.PNG": "kitchen-window-bench",
  "IMG_4622.PNG": "kitchen-cream-walnut",
  "IMG_4623.PNG": "kitchen-white-gray",
  "IMG_4659.PNG": "kitchen-shaker-wood",
  "IMG_4660.PNG": "kitchen-u-shape",
  "IMG_4662.PNG": "drawer-organizer-oak",
  "IMG_4663.PNG": "drawer-organizer-walnut",
  "IMG_4627.PNG": "wardrobe-vanity-led",
  "IMG_4628.PNG": "wardrobe-vanity-white",
  "IMG_4634.PNG": "wardrobe-mirror-gloss",
  "IMG_4636.PNG": "wardrobe-classic-cream",
  "IMG_4637.PNG": "wardrobe-walnut-display",
  "IMG_4638.PNG": "wardrobe-sliding-walnut",
  "IMG_4639.PNG": "wardrobe-open-oak",
  "IMG_4640.PNG": "closet-organizer",
  "IMG_4642.PNG": "wardrobe-minimal-cream",
  "IMG_4629.PNG": "nightstand-white-wood",
  "IMG_4630.PNG": "nightstand-oak",
  "IMG_4632.PNG": "nightstand-gray",
  "IMG_4633.PNG": "nightstand-white",
  "IMG_4625.PNG": "coffee-nook-cane",
  "IMG_4626.PNG": "coffee-bar-shelf",
  "IMG_4664.PNG": "coffee-bar-neo-black",
  "IMG_4665.PNG": "coffee-bar-neo-cream",
  "IMG_4667.PNG": "coffee-bar-neo-niche",
};

const result = {};
for (const [srcName, outName] of Object.entries(MAP)) {
  const srcPath = path.join(root, srcName);
  const input = await fs.readFile(srcPath);
  const optimized = await sharp(input)
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });
  const blur = await sharp(optimized.data)
    .resize(14, 14, { fit: "inside" })
    .webp({ quality: 30 })
    .toBuffer();
  await fs.writeFile(path.join(outDir, `${outName}.webp`), optimized.data);
  result[outName] = {
    src: `/works-photos/${outName}.webp`,
    width: optimized.info.width,
    height: optimized.info.height,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
  };
  console.log(`${srcName} -> ${outName}.webp ${optimized.info.width}x${optimized.info.height}`);
}

await fs.writeFile(
  path.join(root, "src", "lib", "seed-images.json"),
  JSON.stringify(result, null, 2),
);
console.log(`\nwrote src/lib/seed-images.json with ${Object.keys(result).length} entries`);
