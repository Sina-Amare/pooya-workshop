import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { put, del, list } from "@vercel/blob";
import type { SiteContent } from "./types";

/**
 * Storage abstraction:
 *  - Production (Vercel + Blob store): content.json and images live in Vercel Blob.
 *  - Local development: content in .data/content.json, images in public/uploads.
 *  - No storage configured in production: read-only (seed content is shown).
 */

export type StorageMode = "blob" | "local" | "readonly";

export function storageMode(): StorageMode {
  // Explicit override, e.g. demo deployments on hosts without a writable disk.
  const forced = process.env.STORAGE_MODE;
  if (forced === "readonly" || forced === "local" || forced === "blob") return forced;
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  if (process.env.NODE_ENV === "development" || !process.env.VERCEL) return "local";
  return "readonly";
}

const CONTENT_PATHNAME = "data/content.json";
const LOCAL_DATA_DIR = path.join(process.cwd(), ".data");
const LOCAL_CONTENT = path.join(LOCAL_DATA_DIR, "content.json");
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/** Cached blob URL of content.json (stable per store). */
let contentBlobUrl: string | null = null;

async function findContentBlobUrl(): Promise<string | null> {
  if (contentBlobUrl) return contentBlobUrl;
  const { blobs } = await list({ prefix: CONTENT_PATHNAME, limit: 1 });
  contentBlobUrl = blobs[0]?.url ?? null;
  return contentBlobUrl;
}

export async function readStoredContent(): Promise<SiteContent | null> {
  const mode = storageMode();
  if (mode === "blob") {
    try {
      const url = await findContentBlobUrl();
      if (!url) return null;
      // Cache-busting query dodges the Blob CDN cache; reads only happen at
      // ISR revalidation time so this stays cheap.
      const res = await fetch(`${url}?v=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) return null;
      return (await res.json()) as SiteContent;
    } catch {
      return null;
    }
  }
  if (mode === "local") {
    try {
      const raw = await fs.readFile(LOCAL_CONTENT, "utf8");
      return JSON.parse(raw) as SiteContent;
    } catch {
      return null;
    }
  }
  return null;
}

export async function writeStoredContent(content: SiteContent): Promise<void> {
  const mode = storageMode();
  const body = JSON.stringify(content, null, 2);
  if (mode === "blob") {
    const result = await put(CONTENT_PATHNAME, body, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
    contentBlobUrl = result.url;
    return;
  }
  if (mode === "local") {
    await fs.mkdir(LOCAL_DATA_DIR, { recursive: true });
    await fs.writeFile(LOCAL_CONTENT, body, "utf8");
    return;
  }
  throw new Error("storage-not-configured");
}

export interface StoredImage {
  url: string;
}

export async function storeImage(
  buffer: Buffer,
  filename: string,
  contentType: string,
): Promise<StoredImage> {
  const mode = storageMode();
  if (mode === "blob") {
    const result = await put(`images/${filename}`, buffer, {
      access: "public",
      addRandomSuffix: true,
      contentType,
      cacheControlMaxAge: 31536000,
    });
    return { url: result.url };
  }
  if (mode === "local") {
    await fs.mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
    const unique = `${Date.now().toString(36)}-${filename}`;
    await fs.writeFile(path.join(LOCAL_UPLOAD_DIR, unique), buffer);
    return { url: `/uploads/${unique}` };
  }
  throw new Error("storage-not-configured");
}

export async function removeImage(url: string): Promise<void> {
  const mode = storageMode();
  try {
    if (mode === "blob" && url.includes("blob.vercel-storage.com")) {
      await del(url);
    } else if (mode === "local" && url.startsWith("/uploads/")) {
      // basename() defuses any traversal segments in a stored src.
      const target = path.resolve(LOCAL_UPLOAD_DIR, path.basename(url));
      if (target.startsWith(LOCAL_UPLOAD_DIR + path.sep)) {
        await fs.unlink(target);
      }
    }
  } catch {
    // Removing a missing file is not a failure worth surfacing.
  }
}

/** Seed/demo images are shared fixtures and must never be deleted from disk. */
export function isDeletableImage(src: string): boolean {
  return !src.startsWith("/demo/") && !src.startsWith("/works-photos/");
}

/** Allow-list check for stored image sources; rejects traversal and javascript: URLs. */
export function isValidImageSrc(src: unknown): src is string {
  if (typeof src !== "string" || src.includes("..")) return false;
  return (
    /^\/demo\/[\w.-]+$/.test(src) ||
    /^\/works-photos\/[\w.-]+$/.test(src) ||
    /^\/uploads\/[\w.-]+$/.test(src) ||
    /^https:\/\/[\w.-]+\.blob\.vercel-storage\.com\//.test(src)
  );
}
