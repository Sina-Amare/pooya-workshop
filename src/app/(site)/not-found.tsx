import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="container-site grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <p className="font-display text-[6rem] font-bold leading-none text-line-strong">
          ۴۰۴
        </p>
        <h1 className="heading-section mt-4 text-2xl">این صفحه پیدا نشد</h1>
        <p className="mt-3 text-muted">
          احتمالاً آدرس عوض شده یا این صفحه دیگر روی سایت نیست.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-xl bg-espresso px-6 py-3 font-semibold text-bone transition-colors hover:bg-espresso-2"
          >
            صفحه اصلی
          </Link>
          <Link
            href="/works"
            className="group flex items-center gap-2 rounded-xl border border-line-strong px-6 py-3 font-semibold transition-colors hover:border-copper/60 hover:text-copper"
          >
            نمونه‌کارها
            <ArrowLeftIcon size={17} className="transition-transform group-hover:-translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
