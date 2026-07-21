import { NextRequest, NextResponse } from "next/server";
import { guardAdmin, jsonError } from "@/lib/api-utils";
import { getEditableContent, saveContent } from "@/lib/content";
import { sanitizeImages } from "@/lib/project-input";
import { isDeletableImage, removeImage } from "@/lib/storage";
import { faNum } from "@/lib/fa";
import type { ImageRef } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const guard = await guardAdmin();
  if (guard) return guard;
  const { id } = await params;

  let body: { title?: string; description?: string; cover?: ImageRef | null };
  try {
    body = await request.json();
  } catch {
    return jsonError("درخواست نامعتبر است.");
  }

  const content = await getEditableContent();
  const category = content.categories.find((c) => c.id === id);
  if (!category) return jsonError("دسته‌بندی پیدا نشد.", 404);

  if (body.title !== undefined) {
    const title = body.title.trim();
    if (!title) return jsonError("نام دسته‌بندی نمی‌تواند خالی باشد.");
    if (content.categories.some((c) => c.id !== id && c.title === title)) {
      return jsonError("دسته‌ای با همین نام از قبل وجود دارد.");
    }
    category.title = title;
  }
  if (body.description !== undefined) {
    category.description = body.description.trim() || undefined;
  }

  const oldCover = category.cover;
  if (body.cover !== undefined) {
    category.cover = body.cover
      ? sanitizeImages([body.cover], category.title)[0]
      : undefined;
  }

  await saveContent(content);

  // Clean up the previous stored cover if it was replaced or cleared.
  if (
    body.cover !== undefined &&
    oldCover &&
    oldCover.src !== category.cover?.src &&
    isDeletableImage(oldCover.src)
  ) {
    await removeImage(oldCover.src);
  }
  return NextResponse.json(category);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const guard = await guardAdmin();
  if (guard) return guard;
  const { id } = await params;

  const content = await getEditableContent();
  const category = content.categories.find((c) => c.id === id);
  if (!category) return jsonError("دسته‌بندی پیدا نشد.", 404);

  const used = content.projects.filter((p) => p.categoryId === id).length;
  if (used > 0) {
    return jsonError(
      `این دسته ${faNum(used)} پروژه دارد. اول پروژه‌ها را جابه‌جا یا حذف کنید.`,
      409,
    );
  }

  content.categories = content.categories.filter((c) => c.id !== id);
  content.categories.forEach((c, i) => {
    c.order = i + 1;
  });
  await saveContent(content);

  if (category.cover && isDeletableImage(category.cover.src)) {
    await removeImage(category.cover.src);
  }
  return NextResponse.json({ ok: true });
}
