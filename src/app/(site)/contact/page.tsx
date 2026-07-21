import type { Metadata } from "next";
import {
  ClockIcon,
  InstagramIcon,
  MapPinIcon,
  PhoneIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { getContent } from "@/lib/content";
import { formatPhone, phoneHref, whatsappHref } from "@/lib/fa";

export const metadata: Metadata = {
  title: "تماس",
  description: "راه‌های تماس، ساعت پاسخ‌گویی و هماهنگی بازدید حضوری.",
};

export default async function ContactPage() {
  const { settings } = await getContent();

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="container-site py-12 md:py-16">
          <p className="eyebrow">در تماس باشیم</p>
          <h1 className="heading-display mt-3 text-3xl md:text-5xl">تماس با {settings.businessName}</h1>
          <p className="mt-4 max-w-2xl leading-8 text-muted">
            برای مشاوره، برآورد قیمت یا هماهنگی بازدید، از هر کدام از راه‌های زیر
            که راحت‌ترید استفاده کنید. اگر عکس یا نقشه فضا را بفرستید، سریع‌تر
            راهنمایی‌تان می‌کنم.
          </p>
        </div>
      </section>

      <section className="container-site grid gap-12 py-12 md:grid-cols-[1.1fr_0.9fr] md:py-16 lg:gap-16">
        <div className="flex flex-col gap-4">
          <a
            href={`tel:${phoneHref(settings.phone)}`}
            className="group flex items-center gap-5 rounded-2xl bg-espresso p-6 text-bone transition-colors hover:bg-espresso-2"
          >
            <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-bone/10">
              <PhoneIcon size={24} />
            </span>
            <span className="min-w-0">
              <span className="block text-[0.82rem] text-bone-dim">
                تماس مستقیم — سریع‌ترین راه
              </span>
              <span className="mt-1 block font-display text-2xl font-bold" dir="ltr">
                {formatPhone(settings.phone)}
              </span>
            </span>
          </a>

          {settings.whatsapp && (
            <a
              href={whatsappHref(settings.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-5 rounded-2xl border border-line-strong bg-surface p-6 transition-colors hover:border-copper/60"
            >
              <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-cream text-copper">
                <WhatsAppIcon size={24} />
              </span>
              <span>
                <span className="block text-[0.82rem] text-muted">واتساپ</span>
                <span className="mt-1 block font-display text-lg font-bold">
                  ارسال عکس فضا و دریافت مشاوره
                </span>
              </span>
            </a>
          )}

          {settings.instagram && (
            <a
              href={`https://instagram.com/${settings.instagram.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-5 rounded-2xl border border-line-strong bg-surface p-6 transition-colors hover:border-copper/60"
            >
              <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-cream text-copper">
                <InstagramIcon size={24} />
              </span>
              <span>
                <span className="block text-[0.82rem] text-muted">اینستاگرام</span>
                <span className="mt-1 block font-display text-lg font-bold" dir="ltr">
                  @{settings.instagram.replace("@", "")}
                </span>
              </span>
            </a>
          )}
        </div>

        <aside className="h-fit rounded-2xl bg-cream p-7 md:p-8">
          <h2 className="font-display text-xl font-bold">اطلاعات تکمیلی</h2>
          <ul className="mt-6 space-y-5">
            {settings.hours && (
              <li className="flex items-start gap-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-surface text-copper">
                  <ClockIcon size={18} />
                </span>
                <div>
                  <p className="text-[0.8rem] text-muted">ساعت پاسخ‌گویی</p>
                  <p className="mt-0.5 font-semibold">{settings.hours}</p>
                </div>
              </li>
            )}
            {settings.address && (
              <li className="flex items-start gap-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-surface text-copper">
                  <MapPinIcon size={18} />
                </span>
                <div>
                  <p className="text-[0.8rem] text-muted">نشانی کارگاه</p>
                  <p className="mt-0.5 font-semibold">{settings.address}</p>
                </div>
              </li>
            )}
          </ul>
          <p className="mt-7 border-t border-line-strong/60 pt-5 text-[0.88rem] leading-7 text-muted">
            بازدید حضوری از کارگاه و پروژه‌های در حال ساخت، با هماهنگی قبلی
            امکان‌پذیر است.
          </p>
        </aside>
      </section>

      <section className="border-t border-line bg-surface">
        <div className="container-site py-12 md:py-16">
          <p className="eyebrow">بدون نگرانی از هزینه</p>
          <h2 className="heading-section mt-3 text-2xl md:text-3xl">
            قیمت چطور حساب می‌شود؟
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-paper p-6">
              <h3 className="font-display text-lg font-semibold">۱. بازدید رایگان</h3>
              <p className="mt-2 text-[0.9rem] leading-8 text-muted">
                اول از فضا بازدید می‌کنم و دقیق اندازه می‌گیرم؛ برای بازدید و مشاوره هیچ
                هزینه‌ای نمی‌پردازید.
              </p>
            </div>
            <div className="rounded-2xl bg-paper p-6">
              <h3 className="font-display text-lg font-semibold">۲. عوامل قیمت</h3>
              <p className="mt-2 text-[0.9rem] leading-8 text-muted">
                قیمت بر اساس ابعاد کار، نوع ورق و روکش و کیفیت یراق‌آلات مشخص
                می‌شود؛ هر گزینه را با قیمتش به شما نشان می‌دهم.
              </p>
            </div>
            <div className="rounded-2xl bg-paper p-6">
              <h3 className="font-display text-lg font-semibold">۳. برآورد کتبی</h3>
              <p className="mt-2 text-[0.9rem] leading-8 text-muted">
                قبل از شروع، ریز هزینه‌ها را کتبی می‌گیرید؛ وسط کار عدد جدیدی
                اضافه نمی‌شود.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
