"use client";

const MAX_DIM = 2560;
const QUALITY = 0.85;
const SKIP_BELOW_BYTES = 500 * 1024;

/**
 * Shrink a photo in the browser before upload: keeps uploads fast on mobile
 * data and safely below the server's request-size limit. The server still
 * re-encodes for final optimization.
 */
export async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file; // Unsupported format — let the server try.
  }

  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < SKIP_BELOW_BYTES) {
    bitmap.close();
    return file;
  }

  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", QUALITY),
  );
  if (!blob) return file;
  // If compression somehow made it bigger, keep the original.
  return blob.size < file.size ? blob : file;
}
