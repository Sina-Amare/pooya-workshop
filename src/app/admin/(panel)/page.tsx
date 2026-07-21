import Link from "next/link";
import {
  ImageIcon,
  PlusIcon,
  SettingsIcon,
} from "@/components/icons";
import { getContent } from "@/lib/content";
import { faNum } from "@/lib/fa";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const content = await getContent();

  const actions = [
    {
      href: "/admin/projects/new",
      title: "اضافه کردن کار جدید",
      text: "عکس کار تازه را بارگذاری کنید تا روی سایت برود",
      icon: PlusIcon,
      primary: true,
    },
    {
      href: "/admin/projects",
      title: "کارهای من",
      text: "دیدن، ویرایش یا حذف کارهایی که روی سایت است",
      icon: ImageIcon,
    },
    {
      href: "/admin/settings",
      title: "مشخصات و راه‌های تماس",
      text: "عکس شما، شماره تلفن و متن‌های سایت",
      icon: SettingsIcon,
    },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-7">
      <div>
        <h1 className="heading-section text-2xl md:text-3xl">
          سلام {content.settings.ownerName}
        </h1>
        <p className="mt-2 leading-8 text-muted">
          الان {faNum(content.projects.length)} کار در {faNum(content.categories.length)}{" "}
          دسته روی سایت شماست.
        </p>
      </div>

      <div className="space-y-3.5">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`group flex items-center gap-5 rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] sm:p-6 ${
                action.primary
                  ? "border-espresso bg-espresso text-bone"
                  : "border-line bg-surface"
              }`}
            >
              <span
                className={`grid size-14 shrink-0 place-items-center rounded-xl ${
                  action.primary ? "bg-bone/10 text-copper" : "bg-cream text-copper"
                }`}
              >
                <Icon size={26} />
              </span>
              <span>
                <span className="block font-display text-xl font-bold">
                  {action.title}
                </span>
                <span
                  className={`mt-1 block text-[0.9rem] leading-7 ${
                    action.primary ? "text-bone-dim" : "text-muted"
                  }`}
                >
                  {action.text}
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold">کار با پنل، به همین سادگی است:</h2>
        <ol className="mt-4 space-y-3.5 text-[0.95rem] leading-8 text-ink-2">
          <li className="flex gap-3">
            <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-cream text-[0.85rem] font-bold text-copper">
              ۱
            </span>
            از کار تمام‌شده با گوشی عکس بگیرید.
          </li>
          <li className="flex gap-3">
            <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-cream text-[0.85rem] font-bold text-copper">
              ۲
            </span>
            روی «اضافه کردن کار جدید» بزنید، عکس‌ها را انتخاب کنید و یک اسم برای کار
            بنویسید.
          </li>
          <li className="flex gap-3">
            <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-cream text-[0.85rem] font-bold text-copper">
              ۳
            </span>
            دکمه «ذخیره» را بزنید — تمام! کار شما چند لحظه بعد روی سایت است.
          </li>
        </ol>
        <p className="mt-5 border-t border-line pt-4 text-[0.88rem] leading-7 text-muted">
          نگران خراب شدن چیزی نباشید؛ هر تغییری را می‌شود دوباره ویرایش کرد. کیفیت و
          حجم عکس‌ها هم خودکار برای سایت تنظیم می‌شود.
        </p>
      </div>
    </div>
  );
}
