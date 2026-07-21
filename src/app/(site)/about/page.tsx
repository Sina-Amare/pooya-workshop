import type { Metadata } from "next";
import { CheckIcon } from "@/components/icons";
import ContactBand from "@/components/site/ContactBand";
import Reveal from "@/components/site/Reveal";
import SmartImage from "@/components/site/SmartImage";
import { getContent } from "@/lib/content";
import { faNum } from "@/lib/fa";
import { PRINCIPLES } from "@/lib/principles";

export const metadata: Metadata = {
  title: "درباره من",
  description: "آشنایی با سازنده، سابقه کار و روش ساخت کابینت و مصنوعات چوبی سفارشی.",
};

export default async function AboutPage() {
  const { settings } = await getContent();
  const paragraphs = settings.aboutBody.split(/\n\s*\n/).filter(Boolean);

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="container-site grid items-start gap-12 py-14 md:grid-cols-[0.8fr_1.2fr] md:py-20 lg:gap-16">
          <Reveal>
            {settings.portrait && (
              <div className="photo-frame relative aspect-[4/5]">
                <SmartImage
                  image={settings.portrait}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 38vw"
                  className="object-cover"
                />
              </div>
            )}
          </Reveal>
          <div>
            <p className="eyebrow">درباره من</p>
            <h1 className="heading-display mt-3 text-3xl md:text-[2.6rem]">
              {settings.ownerName}؛ {settings.tagline}
            </h1>
            <div className="mt-6 space-y-5 text-[1.02rem] leading-9 text-ink-2">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="mt-9 grid grid-cols-3 gap-4 border-t border-line pt-7 sm:gap-6">
              <div>
                <p className="font-display text-lg font-bold sm:text-xl">
                  {faNum(settings.experienceYears ?? "15")}
                  <span className="text-copper">+</span> سال
                </p>
                <p className="mt-1 text-[0.75rem] text-muted sm:text-[0.78rem]">سابقه کار</p>
              </div>
              <div>
                <p className="font-display text-lg font-bold leading-7 sm:text-xl">
                  رایگان و کتبی
                </p>
                <p className="mt-1 text-[0.75rem] text-muted sm:text-[0.78rem]">
                  مشاوره و برآورد
                </p>
              </div>
              <div>
                <p className="font-display text-lg font-bold leading-7 sm:text-xl">
                  {settings.serviceArea}
                </p>
                <p className="mt-1 text-[0.75rem] text-muted sm:text-[0.78rem]">محدوده خدمات</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-site py-14 md:py-20">
        <p className="eyebrow">اصول کار</p>
        <h2 className="heading-section mt-3 max-w-xl text-3xl md:text-4xl">
          چهار قولی که به هر کارفرما می‌دهم
        </h2>
        <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {PRINCIPLES.map((item, i) => (
            <Reveal key={item.title} delay={(i % 2) * 80}>
              <div className="flex gap-4 border-t-2 border-copper/70 pt-5">
                <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-cream text-copper">
                  <CheckIcon size={16} />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 leading-8 text-muted">{item.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <ContactBand
        settings={settings}
        title="سؤالی درباره پروژه‌تان دارید؟"
      />
    </>
  );
}
