import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "pw_session";
const SESSION_DAYS = 30;

/**
 * Single-owner auth: the admin password comes from ADMIN_PASSWORD.
 * In local development a default password keeps the panel usable out of the box;
 * in production the panel is disabled until a real password is set.
 */
export function getAdminPassword(): string | null {
  const configured = process.env.ADMIN_PASSWORD?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === "development") return "admin";
  return null;
}

export function isUsingDefaultPassword(): boolean {
  return !process.env.ADMIN_PASSWORD?.trim() && process.env.NODE_ENV === "development";
}

function secret(): string {
  // Derive the signing secret from the password so no extra env var is needed.
  return `pw-session::${getAdminPassword() ?? "disabled"}`;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(): string {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + SESSION_DAYS * 86400_000 }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token || !getAdminPassword()) return false;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return false;
  const expected = sign(payload);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

export function checkPassword(candidate: string): boolean {
  const password = getAdminPassword();
  if (!password) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(password);
  // Compare fixed-length digests so length differences leak nothing.
  const da = createHmac("sha256", secret()).update(a).digest();
  const db = createHmac("sha256", secret()).update(b).digest();
  return timingSafeEqual(da, db);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  };
}
