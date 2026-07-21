"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  EyeIcon,
  HomeIcon,
  ImageIcon,
  LogOutIcon,
  SettingsIcon,
  WarningIcon,
} from "@/components/icons";
import { apiFetch } from "@/lib/client/api";
import type { StorageMode } from "@/lib/storage";

interface Props {
  children: React.ReactNode;
  storageMode: StorageMode;
  usingDefaultPassword: boolean;
  businessName: string;
}

const NAV = [
  { href: "/admin", label: "خانه", icon: HomeIcon, exact: true },
  { href: "/admin/projects", label: "کارهای من", icon: ImageIcon },
  { href: "/admin/settings", label: "مشخصات و تماس", icon: SettingsIcon },
];

export default function AdminShell({
  children,
  storageMode,
  usingDefaultPassword,
  businessName,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    try {
      await apiFetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  const isActive = (item: (typeof NAV)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <div className="min-h-dvh bg-paper">
      <header className="border-b border-line bg-surface">
        <div className="container-site flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-md bg-espresso font-display text-lg font-bold text-bone">
              پ
            </span>
            <div className="leading-tight">
              <p className="font-display font-bold">{businessName}</p>
              <p className="text-[0.7rem] text-muted">پنل مدیریت</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              aria-label="مشاهده سایت"
              className="flex items-center gap-2 rounded-lg border border-line-strong px-3.5 py-2 text-[0.85rem] font-semibold transition-colors hover:border-copper/60 hover:text-copper"
            >
              <EyeIcon size={16} />
              <span className="hidden sm:inline">مشاهده سایت</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              aria-label="خروج از پنل"
              className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-[0.85rem] font-semibold text-muted transition-colors hover:text-[#a03325]"
            >
              <LogOutIcon size={16} />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
        <nav className="container-site -mb-px flex gap-1 overflow-x-auto" aria-label="بخش‌های مدیریت">
          {NAV.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-[0.9rem] font-semibold transition-colors ${
                  active
                    ? "border-copper text-copper"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {(storageMode === "readonly" || usingDefaultPassword) && (
        <div className="container-site mt-4 space-y-2">
          {storageMode === "readonly" && (
            <p className="flex items-start gap-2.5 rounded-xl border border-copper/35 bg-[#f7efdf] px-4 py-3 text-[0.85rem] leading-7 text-[#6e4218]">
              <WarningIcon size={18} className="mt-1 shrink-0 text-copper" />
              این نسخه نمایشی است و ذخیره تغییرات در آن غیرفعال است؛ می‌توانید همه
              بخش‌های پنل را ببینید.
            </p>
          )}
          {usingDefaultPassword && (
            <p className="flex items-start gap-2.5 rounded-xl border border-copper/35 bg-[#f7efdf] px-4 py-3 text-[0.85rem] leading-7 text-[#6e4218]">
              <WarningIcon size={18} className="mt-1 shrink-0 text-copper" />
              با رمز پیش‌فرض حالت توسعه وارد شده‌اید؛ این پیام روی سایت اصلی نمایش
              داده نمی‌شود. قبل از انتشار، یک رمز اختصاصی (ADMIN_PASSWORD) تنظیم کنید.
            </p>
          )}
        </div>
      )}

      <main className="container-site py-6 md:py-8">{children}</main>
    </div>
  );
}
