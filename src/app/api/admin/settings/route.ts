import { NextRequest, NextResponse } from "next/server";
import { guardAdmin, jsonError } from "@/lib/api-utils";
import { getEditableContent, saveContent } from "@/lib/content";
import { sanitizeImages } from "@/lib/project-input";
import { isDeletableImage, removeImage } from "@/lib/storage";
import type { SiteSettings } from "@/lib/types";

const STRING_FIELDS: Array<keyof SiteSettings> = [
  "businessName",
  "ownerName",
  "tagline",
  "heroTitle",
  "heroSubtitle",
  "aboutIntro",
  "aboutBody",
  "phone",
  "whatsapp",
  "instagram",
  "address",
  "serviceArea",
  "hours",
  "experienceYears",
];

export async function PATCH(request: NextRequest) {
  const guard = await guardAdmin();
  if (guard) return guard;

  let body: Partial<SiteSettings>;
  try {
    body = await request.json();
  } catch {
    return jsonError("درخواست نامعتبر است.");
  }

  const content = await getEditableContent();
  const settings = content.settings;

  for (const field of STRING_FIELDS) {
    const value = body[field];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if ((field === "businessName" || field === "ownerName" || field === "phone") && !trimmed) {
        return jsonError("نام کسب‌وکار، نام شما و شماره تماس نمی‌توانند خالی باشند.");
      }
      // Cleared fields are stored as "" (not undefined) so they survive JSON
      // serialization and are not resurrected from the seed defaults.
      (settings as unknown as Record<string, unknown>)[field] = trimmed;
    }
  }

  const oldPortrait = settings.portrait;
  const oldHeroImage = settings.heroImage;
  if (body.portrait !== undefined) {
    settings.portrait = body.portrait
      ? (sanitizeImages([body.portrait], settings.ownerName)[0] ?? null)
      : null;
  }
  if (body.heroImage !== undefined) {
    settings.heroImage = body.heroImage
      ? (sanitizeImages([body.heroImage], settings.businessName)[0] ?? null)
      : null;
  }

  await saveContent(content);

  // Clean up replaced or cleared stored files.
  for (const [oldImg, current] of [
    [oldPortrait, settings.portrait],
    [oldHeroImage, settings.heroImage],
  ] as const) {
    if (oldImg && oldImg.src !== current?.src && isDeletableImage(oldImg.src)) {
      await removeImage(oldImg.src);
    }
  }
  return NextResponse.json(settings);
}
