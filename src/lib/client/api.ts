"use client";

/** JSON fetch wrapper: throws Error with a Persian message the UI can show directly. */
export async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers:
        options.body instanceof FormData
          ? undefined
          : { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error("ارتباط با سرور برقرار نشد. اینترنت را بررسی کنید.");
  }

  if (response.status === 401) {
    window.location.href = "/admin/login";
    throw new Error("نشست شما منقضی شده؛ دوباره وارد شوید.");
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    // Non-JSON response body.
  }

  if (!response.ok) {
    const message =
      (data as { error?: string } | null)?.error ?? "خطای غیرمنتظره‌ای رخ داد.";
    throw new Error(message);
  }
  return data as T;
}
