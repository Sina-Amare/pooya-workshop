import { NextRequest, NextResponse } from "next/server";
import { guardAdmin, jsonError } from "@/lib/api-utils";
import { getEditableContent, saveContent } from "@/lib/content";
import { sanitizeImages } from "@/lib/project-input";
import { newId, uniqueSlug } from "@/lib/slug";
import type { Category, ImageRef } from "@/lib/types";

export async function POST(request: NextRequest) {
  const guard = await guardAdmin();
  if (guard) return guard;

  let body: { title?: string; description?: string; cover?: ImageRef };
  try {
    body = await request.json();
  } catch {
    return jsonError("درخواست نامعتبر است.");
  }

  const title = body.title?.trim();
  if (!title) return jsonError("نام دسته‌بندی را بنویسید.");

  const content = await getEditableContent();
  if (content.categories.some((c) => c.title === title)) {
    return jsonError("دسته‌ای با همین نام از قبل وجود دارد.");
  }

  const category: Category = {
    id: newId("cat"),
    title,
    slug: uniqueSlug(title, new Set(content.categories.map((c) => c.slug))),
    description: body.description?.trim() || undefined,
    cover: body.cover ? sanitizeImages([body.cover], title)[0] : undefined,
    order: content.categories.length + 1,
  };
  content.categories.push(category);
  await saveContent(content);
  return NextResponse.json(category);
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
  for (const category of content.categories) {
    const order = orderMap.get(category.id);
    if (order !== undefined) category.order = order;
  }
  content.categories.sort((a, b) => a.order - b.order);
  await saveContent(content);
  return NextResponse.json({ ok: true });
}
