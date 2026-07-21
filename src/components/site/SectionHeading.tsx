import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";

interface Props {
  eyebrow: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  tone?: "light" | "dark";
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
  tone = "light",
}: Props) {
  const dark = tone === "dark";
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-12">
      <div className="max-w-2xl">
        <p className={`eyebrow ${dark ? "text-bone-dim" : ""}`}>{eyebrow}</p>
        <h2
          className={`heading-section mt-3 text-3xl md:text-4xl ${
            dark ? "text-bone" : "text-ink"
          }`}
        >
          {title}
        </h2>
        {description && (
          <p className={`mt-4 leading-8 ${dark ? "text-bone-dim" : "text-muted"}`}>
            {description}
          </p>
        )}
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className={`group flex items-center gap-2 border-b pb-1 text-[0.95rem] font-semibold transition-colors ${
            dark
              ? "border-bone/40 text-bone hover:border-bone"
              : "border-copper/40 text-copper hover:border-copper"
          }`}
        >
          {linkLabel}
          <ArrowLeftIcon
            size={17}
            className="transition-transform group-hover:-translate-x-1"
          />
        </Link>
      )}
    </div>
  );
}
