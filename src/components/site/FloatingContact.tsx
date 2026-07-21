"use client";

import { useEffect, useState } from "react";
import { PhoneIcon, WhatsAppIcon } from "@/components/icons";

interface Props {
  whatsapp?: string;
  phoneHref: string;
  whatsappHref?: string;
}

/**
 * Mobile-only sticky contact bar: slides in after the visitor scrolls past the
 * hero so there is always a one-tap way to call or message.
 */
export default function FloatingContact({ whatsapp, phoneHref, whatsappHref }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 550);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hasWhatsapp = Boolean(whatsapp && whatsappHref);

  return (
    <div
      data-testid="floating-contact"
      inert={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 transition-all duration-300 md:hidden ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-6 opacity-0"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-4 mb-3 flex gap-2 rounded-2xl border border-line bg-surface/95 p-2 shadow-[var(--shadow-card-lg)] backdrop-blur-md">
        <a
          href={`tel:${phoneHref}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-espresso py-3 text-[0.95rem] font-bold text-bone"
        >
          <PhoneIcon size={18} />
          تماس
        </a>
        {hasWhatsapp && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line-strong py-3 text-[0.95rem] font-bold text-ink"
          >
            <WhatsAppIcon size={18} className="text-copper" />
            واتساپ
          </a>
        )}
      </div>
    </div>
  );
}
