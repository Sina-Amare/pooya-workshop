import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { getAdminPassword, isAuthenticated, isUsingDefaultPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ورود به پنل مدیریت",
  robots: { index: false },
};

export default async function LoginPage() {
  if (await isAuthenticated()) redirect("/admin");
  const enabled = Boolean(getAdminPassword());

  return (
    <div className="grid min-h-dvh place-items-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-xl bg-espresso font-display text-2xl font-bold text-bone">
            پ
          </span>
          <h1 className="heading-section mt-4 text-2xl">پنل مدیریت سایت</h1>
          <p className="mt-2 text-[0.9rem] text-muted">
            برای مدیریت نمونه‌کارها و محتوای سایت وارد شوید
          </p>
        </div>
        {enabled ? (
          <LoginForm defaultPasswordHint={isUsingDefaultPassword()} />
        ) : (
          <div className="rounded-2xl border border-[#c8a13d]/40 bg-[#fdf6e3] p-5 text-[0.9rem] leading-8 text-[#7a5c10]">
            پنل مدیریت هنوز فعال نشده است. در تنظیمات پروژه در Vercel، متغیر
            <code className="mx-1 rounded bg-white/70 px-1.5 py-0.5 font-mono text-[0.8rem]" dir="ltr">
              ADMIN_PASSWORD
            </code>
            را با یک رمز قوی اضافه کنید و دوباره Deploy بزنید.
          </div>
        )}
      </div>
    </div>
  );
}
