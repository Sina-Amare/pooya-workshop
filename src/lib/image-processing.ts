import "server-only";
import type { ImageRef } from "./types";
import { storeImage } from "./storage";

const MAX_DIMENSION = 2400;
const WEBP_QUALITY = 82;

/**
 * Normalize an uploaded photo: apply EXIF rotation, strip metadata, cap the
 * long edge and re-encode as WebP. Also produces a tiny blur placeholder so
 * images fade in instead of popping.
 */
export async function processAndStoreImage(
  input: Buffer,
  baseName: string,
): Promise<ImageRef> {
  // Lazy import: sharp is a native module that cannot even be loaded on
  // Cloudflare Workers; uploads are guarded off there by readonly mode.
  const { default: sharp } = await import("sharp");
  // limitInputPixels guards against decompression bombs (~80MP cap).
  const pipeline = sharp(input, { failOn: "error", limitInputPixels: 80_000_000 }).rotate();
  const metadata = await pipeline.metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error("invalid-image");
  }

  const optimized = await pipeline
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer({ resolveWithObject: true });

  const blur = await sharp(optimized.data)
    .resize(14, 14, { fit: "inside" })
    .webp({ quality: 30 })
    .toBuffer();

  const safeName = `${baseName.replace(/[^a-z0-9-]/gi, "").slice(0, 40) || "photo"}.webp`;
  const stored = await storeImage(optimized.data, safeName, "image/webp");

  return {
    src: stored.url,
    width: optimized.info.width,
    height: optimized.info.height,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
  };
}
