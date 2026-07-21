import { NextRequest, NextResponse } from "next/server";
import { guardAdmin, jsonError } from "@/lib/api-utils";
import { getEditableContent, saveContent } from "@/lib/content";
import { newId, uniqueSlug } from "@/lib/slug";
import {
  sanitizeImages,
  validateProjectInput,
  type ProjectInput,
} from "@/lib/project-input";
import type { Project } from "@/lib/types";

export async function POST(request: NextRequest) {
  const guard = await guardAdmin();
  if (guard) return guard;

  let body: ProjectInput;
  try {
    body = await request.json();
  } catch {
    return jsonError("درخواست نامعتبر است.");
  }

  const invalid = validateProjectInput(body);
  if (invalid) return jsonError(invalid);

  const content = await getEditableContent();
  if (!content.categories.some((c) => c.id === body.categoryId)) {
    return jsonError("دسته‌بندی انتخاب‌شده وجود ندارد.");
  }

  const title = body.title!.trim();
  const project: Project = {
    id: newId("prj"),
    title,
    slug: uniqueSlug(title, new Set(content.projects.map((p) => p.slug))),
    categoryId: body.categoryId!,
    summary: body.summary?.trim() || undefined,
    description: body.description?.trim() || undefined,
    materials: body.materials?.map((m) => m.trim()).filter(Boolean),
    location: body.location?.trim() || undefined,
    year: body.year?.trim() || undefined,
    featured: Boolean(body.featured),
    order: 0,
    createdAt: new Date().toISOString(),
    images: sanitizeImages(body.images, title),
  };

  // New projects go to the top.
  content.projects.unshift(project);
  content.projects.forEach((p, i) => {
    p.order = i + 1;
  });

  await saveContent(content);
  return NextResponse.json(project);
}

/** Reorder: body = { ids: string[] } in the desired order. */
export async function PUT(request: NextRequest) {
  const guard = await guardAdmin();
  if (guard) return guard;

  let body: { ids?: string[] };
  try {
    body = await request.json();
  } catch {
    return jsonError("درخواست نامعتبر است.");
  }
  if (!Array.isArray(body.ids)) return jsonError("ترتیب نامعتبر است.");

  const content = await getEditableContent();
  const orderMap = new Map(body.ids.map((id, i) => [id, i + 1]));
  for (const project of content.projects) {
    const order = orderMap.get(project.id);
    if (order !== undefined) project.order = order;
  }
  content.projects.sort((a, b) => a.order - b.order);
  await saveContent(content);
  return NextResponse.json({ ok: true });
}
