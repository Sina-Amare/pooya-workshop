import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  checkPassword,
  createSessionToken,
  getAdminPassword,
  sessionCookieOptions,
} from "@/lib/auth";
import { jsonError } from "@/lib/api-utils";

/** Naive per-instance brute-force damper; resets on cold start, good enough for a single-owner panel. */
const attempts = new Map<string, { count: number; last: number }>();
const WINDOW_MS = 10 * 60_000;
const MAX_ATTEMPTS = 8;

export async function POST(request: NextRequest) {
  if (!getAdminPassword()) {
    return jsonError(
      "پنل مدیریت هنوز فعال نشده است. متغیر ADMIN_PASSWORD را در تنظیمات Vercel اضافه کنید.",
      503,
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry && now - entry.last < WINDOW_MS && entry.count >= MAX_ATTEMPTS) {
    return jsonError("تلاش بیش از حد؛ چند دقیقه بعد دوباره امتحان کنید.", 429);
  }

  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return jsonError("درخواست نامعتبر است.");
  }

  if (!checkPassword(password)) {
    const next = entry && now - entry.last < WINDOW_MS ? entry.count + 1 : 1;
    attempts.set(ip, { count: next, last: now });
    return jsonError("رمز عبور درست نیست.", 401);
  }

  attempts.delete(ip);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions());
  return response;
}
