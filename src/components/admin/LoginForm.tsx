"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, TextInput } from "@/components/admin/ui";
import { apiFetch } from "@/lib/client/api";

export default function LoginForm({
  defaultPasswordHint,
}: {
  defaultPasswordHint: boolean;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await apiFetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ورود انجام نشد؛ دوباره امتحان کنید.");
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-card)]"
    >
      <label className="block">
        <span className="mb-1.5 block text-[0.88rem] font-semibold">رمز عبور</span>
        <TextInput
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
          autoComplete="current-password"
          placeholder={defaultPasswordHint ? "admin" : "••••••••"}
          dir="ltr"
        />
      </label>
      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg bg-[#fbeae7] px-3 py-2 text-[0.85rem] text-[#a03325]"
        >
          {error}
        </p>
      )}
      <Button type="submit" busy={busy} className="mt-5 w-full py-3">
        ورود به پنل
      </Button>
    </form>
  );
}
