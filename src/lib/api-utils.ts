import "server-only";
import { NextResponse } from "next/server";
import { isAuthenticated } from "./auth";
import { storageMode } from "./storage";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Guard for admin API routes: returns a response to short-circuit with, or null. */
export async function guardAdmin(): Promise<NextResponse | null> {
  if (!(await isAuthenticated())) {
    return jsonError("برای انجام این کار باید وارد شوید.", 401);
  }
  if (storageMode() === "readonly") {
    return jsonError(
      "فضای ذخیره‌سازی هنوز فعال نشده است. در تنظیمات Vercel یک Blob Store بسازید.",
      503,
    );
  }
  return null;
}
