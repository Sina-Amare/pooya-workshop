import {
  InstagramIcon,
  PhoneIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { formatPhone, phoneHref, whatsappHref } from "@/lib/fa";
import type { SiteSettings } from "@/lib/types";

interface Props {
  settings: SiteSettings;
  title?: string;
  description?: string;
}

export default function ContactBand({
  settings,
  title = "پروژه‌ای در ذهن دارید؟",
  description = "برای مشاوره رایگان و هماهنگی بازدید، همین حالا تماس بگیرید یا در واتساپ پیام بدهید. عکس فضا را بفرستید تا سریع‌تر راهنمایی‌تان کنم.",
}: Props) {
  return (
    <section className="bg-cream">
      <div className="container-site grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="eyebrow">شروع همکاری</p>
          <h2 className="heading-section mt-3 text-3xl md:text-4xl">{title}</h2>
          <p className="mt-4 max-w-lg leading-8 text-muted">{description}</p>
        </div>
        <div className="flex flex-col gap-3">
          <a
            href={`tel:${phoneHref(settings.phone)}`}
            className="group flex items-center justify-between rounded-xl bg-espresso px-6 py-5 text-bone transition-colors hover:bg-espresso-2"
          >
            <span className="flex items-center gap-3.5">
              <span className="grid size-11 place-items-center rounded-lg bg-bone/10">
                <PhoneIcon size={20} />
              </span>
              <span>
                <span className="block text-[0.78rem] text-bone-dim">تماس مستقیم</span>
                <span className="block text-lg font-bold" dir="ltr">
                  {formatPhone(settings.phone)}
                </span>
              </span>
            </span>
          </a>
          {settings.whatsapp && (
            <a
              href={whatsappHref(settings.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl border border-line-strong bg-surface px-6 py-5 transition-colors hover:border-copper/50"
            >
              <span className="flex items-center gap-3.5">
                <span className="grid size-11 place-items-center rounded-lg bg-cream text-copper">
                  <WhatsAppIcon size={20} />
                </span>
                <span>
                  <span className="block text-[0.78rem] text-muted">پیام در واتساپ</span>
                  <span className="block font-bold">عکس فضا را بفرستید</span>
                </span>
              </span>
            </a>
          )}
          {settings.instagram && (
            <a
              href={`https://instagram.com/${settings.instagram.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl border border-line-strong bg-surface px-6 py-5 transition-colors hover:border-copper/50"
            >
              <span className="flex items-center gap-3.5">
                <span className="grid size-11 place-items-center rounded-lg bg-cream text-copper">
                  <InstagramIcon size={20} />
                </span>
                <span>
                  <span className="block text-[0.78rem] text-muted">اینستاگرام</span>
                  <span className="block font-bold" dir="ltr">
                    @{settings.instagram.replace("@", "")}
                  </span>
                </span>
              </span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
