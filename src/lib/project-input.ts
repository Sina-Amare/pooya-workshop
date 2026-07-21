import { isValidImageSrc } from "./storage";
import type { ImageRef } from "./types";

/**
 * Validate and normalize client-supplied images: allow-listed src only,
 * numeric dimensions, and a guaranteed alt text.
 */
export function sanitizeImages(images: unknown, fallbackAlt: string): ImageRef[] {
  if (!Array.isArray(images)) return [];
  const result: ImageRef[] = [];
  for (const raw of images) {
    if (!raw || typeof raw !== "object") continue;
    const img = raw as Partial<ImageRef>;
    if (!isValidImageSrc(img.src)) continue;
    if (!Number.isFinite(img.width) || !Number.isFinite(img.height)) continue;
    result.push({
      src: img.src,
      width: Math.round(img.width as number),
      height: Math.round(img.height as number),
      alt:
        (typeof img.alt === "string" && img.alt.trim()) || fallbackAlt || undefined,
      blurDataURL:
        typeof img.blurDataURL === "string" &&
        img.blurDataURL.startsWith("data:image/")
          ? img.blurDataURL
          : undefined,
    });
  }
  return result;
}

export interface ProjectInput {
  title?: string;
  categoryId?: string;
  summary?: string;
  description?: string;
  materials?: string[];
  location?: string;
  year?: string;
  featured?: boolean;
  images?: ImageRef[];
}

export function validateProjectInput(body: ProjectInput): string | null {
  if (!body.title?.trim()) return "عنوان پروژه را بنویسید.";
  if (!body.categoryId) return "دسته‌بندی پروژه را انتخاب کنید.";
  return null;
}
