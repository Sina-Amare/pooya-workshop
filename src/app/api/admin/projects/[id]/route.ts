import { NextRequest, NextResponse } from "next/server";
import { guardAdmin, jsonError } from "@/lib/api-utils";
import { getEditableContent, saveContent } from "@/lib/content";
import { sanitizeImages, type ProjectInput } from "@/lib/project-input";
import { isDeletableImage, removeImage } from "@/lib/storage";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const guard = await guardAdmin();
  if (guard) return guard;
  const { id } = await params;

  let body: ProjectInput;
  try {
    body = await request.json();
  } catch {
    return jsonError("درخواست نامعتبر است.");
  }

  const content = await getEditableContent();
  const project = content.projects.find((p) => p.id === id);
  if (!project) return jsonError("پروژه پیدا نشد.", 404);

  if (body.title !== undefined) {
    const title = body.title.trim();
    if (!title) return jsonError("عنوان پروژه نمی‌تواند خالی باشد.");
    project.title = title;
  }
  if (body.categoryId !== undefined) {
    if (!content.categories.some((c) => c.id === body.categoryId)) {
      return jsonError("دسته‌بندی انتخاب‌شده وجود ندارد.");
    }
    project.categoryId = body.categoryId;
  }
  if (body.summary !== undefined) project.summary = body.summary.trim() || undefined;
  if (body.description !== undefined)
    project.description = body.description.trim() || undefined;
  if (body.materials !== undefined)
    project.materials = body.materials.map((m) => m.trim()).filter(Boolean);
  if (body.location !== undefined) project.location = body.location.trim() || undefined;
  if (body.year !== undefined) project.year = body.year.trim() || undefined;
  if (body.featured !== undefined) project.featured = Boolean(body.featured);

  if (body.images !== undefined && Array.isArray(body.images)) {
    const sanitized = sanitizeImages(body.images, project.title);
    // Remove stored files for images the user deleted in the editor.
    const keep = new Set(sanitized.map((img) => img.src));
    const removed = project.images.filter(
      (img) => !keep.has(img.src) && isDeletableImage(img.src),
    );
    project.images = sanitized;
    await saveContent(content);
    await Promise.all(removed.map((img) => removeImage(img.src)));
    return NextResponse.json(project);
  }

  await saveContent(content);
  return NextResponse.json(project);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const guard = await guardAdmin();
  if (guard) return guard;
  const { id } = await params;

  const content = await getEditableContent();
  const project = content.projects.find((p) => p.id === id);
  if (!project) return jsonError("پروژه پیدا نشد.", 404);

  content.projects = content.projects.filter((p) => p.id !== id);
  content.projects.forEach((p, i) => {
    p.order = i + 1;
  });
  await saveContent(content);

  await Promise.all(
    project.images
      .filter((img) => isDeletableImage(img.src))
      .map((img) => removeImage(img.src)),
  );
  return NextResponse.json({ ok: true });
}
