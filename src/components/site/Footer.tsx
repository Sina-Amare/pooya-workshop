import Link from "next/link";
import {
  ClockIcon,
  InstagramIcon,
  MapPinIcon,
  PhoneIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { faNum, formatPhone, phoneHref, whatsappHref } from "@/lib/fa";
import type { Category, SiteSettings } from "@/lib/types";

interface Props {
  settings: SiteSettings;
  categories: Category[];
}

function jalaliYear(): string {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric" }).format(
    new Date(),
  );
}

export default function Footer({ settings, categories }: Props) {
  return (
    <footer className="bg-espresso text-bone">
      <div className="container-site grid gap-12 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:py-20">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-bone font-display text-xl font-bold text-espresso">
              پ
            </span>
            <span className="font-display text-xl font-bold">{settings.businessName}</span>
          </div>
          <p className="mt-5 max-w-md leading-8 text-bone-dim">
            {settings.heroSubtitle}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={`tel:${phoneHref(settings.phone)}`}
              className="flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-copper-deep"
            >
              <PhoneIcon size={16} />
              <span dir="ltr">{formatPhone(settings.phone)}</span>
            </a>
            {settings.whatsapp && (
              <a
                href={whatsappHref(settings.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-10 place-items-center rounded-lg border border-bone/25 text-bone transition-colors hover:border-bone/60"
                aria-label="واتساپ"
              >
                <WhatsAppIcon size={18} />
              </a>
            )}
            {settings.instagram && (
              <a
                href={`https://instagram.com/${settings.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-10 place-items-center rounded-lg border border-bone/25 text-bone transition-colors hover:border-bone/60"
                aria-label="اینستاگرام"
              >
                <InstagramIcon size={18} />
              </a>
            )}
          </div>
        </div>

        <nav aria-label="دسته‌بندی نمونه‌کارها">
          <h3 className="text-sm font-semibold text-bone-dim">نمونه‌کارها</h3>
          <ul className="mt-4 space-y-2.5">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/works?cat=${encodeURIComponent(c.slug)}`}
                  className="text-[0.92rem] text-bone/85 transition-colors hover:text-bone"
                >
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="text-sm font-semibold text-bone-dim">اطلاعات تماس</h3>
          <ul className="mt-4 space-y-3.5 text-[0.92rem] text-bone/85">
            {settings.address && (
              <li className="flex items-start gap-2.5">
                <MapPinIcon size={17} className="mt-1 shrink-0 text-bone-dim" />
                {settings.address}
              </li>
            )}
            {settings.hours && (
              <li className="flex items-start gap-2.5">
                <ClockIcon size={17} className="mt-1 shrink-0 text-bone-dim" />
                {settings.hours}
              </li>
            )}
            <li className="flex items-start gap-2.5">
              <PhoneIcon size={17} className="mt-1 shrink-0 text-bone-dim" />
              <a href={`tel:${phoneHref(settings.phone)}`} dir="ltr">
                {formatPhone(settings.phone)}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-bone/10">
        <div className="container-site flex flex-col items-center justify-between gap-2 py-5 text-[0.78rem] text-bone-dim sm:flex-row">
          <p>
            © {jalaliYear()} {settings.businessName} — همه حقوق محفوظ است.
          </p>
          <p>{faNum(`طراحی و ساخت کابینت، کمد و مصنوعات چوبی`)}</p>
        </div>
      </div>
    </footer>
  );
}
