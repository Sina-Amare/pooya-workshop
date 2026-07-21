import "server-only";
import { revalidatePath } from "next/cache";
import { seedContent } from "./seed";
import { readStoredContent, writeStoredContent } from "./storage";
import type { Category, LoadedContent, Project, SiteContent } from "./types";

export async function getContent(): Promise<LoadedContent> {
  const stored = await readStoredContent();
  if (stored) {
    const source = process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local";
    return { ...normalize(stored), source };
  }
  return { ...seedContent, source: "seed" };
}

/** Defensive normalization so a hand-edited or older content file can't crash pages. */
function normalize(content: SiteContent): SiteContent {
  return {
    updatedAt: content.updatedAt ?? new Date().toISOString(),
    // Missing keys fall back to seed defaults; deliberately cleared values
    // ("" / null) survive the merge and stay cleared.
    settings: { ...seedContent.settings, ...content.settings },
    categories: (content.categories ?? [])
      .filter((c) => Boolean(c && c.id && c.title && c.slug))
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    projects: (content.projects ?? [])
      .filter((p) => Boolean(p && p.id && p.title && p.slug))
      .map((p) => ({
        ...p,
        featured: Boolean(p.featured),
        images: Array.isArray(p.images) ? p.images.filter((img) => img?.src) : [],
      }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  };
}

export async function saveContent(next: SiteContent): Promise<void> {
  next.updatedAt = new Date().toISOString();
  await writeStoredContent(next);
  // Regenerate every public page so changes appear immediately.
  revalidatePath("/", "layout");
}

/** Start editing from the currently *stored* content, seeding on first write. */
export async function getEditableContent(): Promise<SiteContent> {
  const stored = await readStoredContent();
  if (stored) return normalize(stored);
  return structuredClone(seedContent);
}

export function findCategory(content: SiteContent, slug: string): Category | undefined {
  const decoded = decodeURIComponent(slug);
  return content.categories.find((c) => c.slug === decoded);
}

export function findProject(content: SiteContent, slug: string): Project | undefined {
  const decoded = decodeURIComponent(slug);
  return content.projects.find((p) => p.slug === decoded);
}

export function projectsInCategory(content: SiteContent, categoryId: string): Project[] {
  return content.projects.filter((p) => p.categoryId === categoryId);
}
