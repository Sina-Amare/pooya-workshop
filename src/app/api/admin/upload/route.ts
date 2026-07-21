import { NextRequest, NextResponse } from "next/server";
import { guardAdmin, jsonError } from "@/lib/api-utils";
import { processAndStoreImage } from "@/lib/image-processing";

export const maxDuration = 60;

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const guard = await guardAdmin();
  if (guard) return guard;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("فایل دریافت نشد.");
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return jsonError("فایل تصویر پیدا نشد.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return jsonError("حجم فایل بیش از ۱۰ مگابایت است. عکس کوچک‌تری انتخاب کنید.");
  }
  if (!file.type.startsWith("image/")) {
    return jsonError("فقط فایل تصویری قابل بارگذاری است.");
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base = file.name.replace(/\.[^.]+$/, "");
    const image = await processAndStoreImage(buffer, base);
    return NextResponse.json(image);
  } catch (error) {
    console.error("upload failed:", error);
    return jsonError("پردازش تصویر ناموفق بود. فایل دیگری را امتحان کنید.", 500);
  }
}
