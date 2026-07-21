"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CloseIcon, MenuIcon, PhoneIcon } from "@/components/icons";
import { formatPhone, phoneHref } from "@/lib/fa";

interface Props {
  businessName: string;
  tagline: string;
  phone: string;
}

const NAV = [
  { href: "/", label: "خانه" },
  { href: "/works", label: "نمونه‌کارها" },
  { href: "/about", label: "درباره من" },
  { href: "/contact", label: "تماس" },
];

export default function Header({ businessName, tagline, phone }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // While the mobile menu covers the page, make the page behind it inert and
  // let Escape close the menu.
  useEffect(() => {
    if (!open) return;
    const background = Array.from(
      document.querySelectorAll("main, footer, [data-testid='floating-contact']"),
    );
    background.forEach((el) => el.setAttribute("inert", ""));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      background.forEach((el) => el.removeAttribute("inert"));
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/92 backdrop-blur-md">
      <div className="container-site flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
        <Link href="/" className="flex items-center gap-3" aria-label={businessName}>
          <span className="grid size-10 place-items-center rounded-md bg-espresso font-display text-xl font-bold text-bone">
            پ
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-lg font-bold">{businessName}</span>
            <span className="text-[0.7rem] text-muted">{tagline}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="منوی اصلی">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`relative py-2 text-[0.92rem] font-medium transition-colors hover:text-copper ${
                isActive(item.href) ? "text-copper" : "text-ink"
              }`}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-copper" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${phoneHref(phone)}`}
            className="hidden items-center gap-2 rounded-lg bg-espresso px-4 py-2.5 text-sm font-semibold text-bone transition-colors hover:bg-espresso-2 sm:flex"
          >
            <PhoneIcon size={16} />
            <span dir="ltr">{formatPhone(phone)}</span>
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid size-11 place-items-center rounded-lg border border-line text-ink md:hidden"
            aria-expanded={open}
            aria-label={open ? "بستن منو" : "باز کردن منو"}
          >
            {open ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </div>

      {open && (
        // Explicit height: the header's backdrop-filter makes it the containing
        // block for fixed children, so bottom-0 would collapse to zero height.
        <div className="fixed inset-x-0 top-16 z-40 flex h-[calc(100dvh-4rem)] flex-col overflow-y-auto bg-paper md:hidden">
          <nav className="container-site flex flex-col pt-4" aria-label="منوی موبایل">
            {NAV.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between border-b border-line py-4 font-display text-xl font-semibold ${
                  isActive(item.href) ? "text-copper" : "text-ink"
                }`}
              >
                {item.label}
                <span className="text-sm text-muted">
                  {String(i + 1).padStart(2, "0").replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d])}
                </span>
              </Link>
            ))}
          </nav>
          <div className="container-site mt-auto pb-10">
            <a
              href={`tel:${phoneHref(phone)}`}
              className="flex items-center justify-center gap-3 rounded-xl bg-espresso py-4 text-lg font-bold text-bone"
            >
              <PhoneIcon size={20} />
              <span dir="ltr">{formatPhone(phone)}</span>
            </a>
            <p className="mt-4 text-center text-sm text-muted">
              پاسخ‌گویی شنبه تا پنج‌شنبه — برای مشاوره رایگان تماس بگیرید
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
