import Link from "next/link";
import {
  ArrowLeftIcon,
  CheckIcon,
  HammerIcon,
  PhoneIcon,
  RulerIcon,
  TruckIcon,
} from "@/components/icons";
import CategoryCard from "@/components/site/CategoryCard";
import ContactBand from "@/components/site/ContactBand";
import ProjectCard from "@/components/site/ProjectCard";
import Reveal from "@/components/site/Reveal";
import SectionHeading from "@/components/site/SectionHeading";
import SmartImage from "@/components/site/SmartImage";
import { getContent, projectsInCategory } from "@/lib/content";
import { faNum, phoneHref } from "@/lib/fa";
import { PRINCIPLES } from "@/lib/principles";

export const revalidate = 300;

export default async function HomePage() {
  const content = await getContent();
  const { settings, categories, projects } = content;
  const featured = projects.filter((p) => p.featured).slice(0, 4);
  const shown = featured.length > 0 ? featured : projects.slice(0, 4);

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings.businessName,
    description: settings.heroSubtitle,
    telephone: phoneHref(settings.phone),
    address: settings.address,
    areaServed: settings.serviceArea,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify does not escape "</script>"; <-escaping prevents
        // stored content from breaking out of the script element.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />

      {/* ---------- Hero: owner-first, editorial ---------- */}
      <section className="relative overflow-hidden">
        <div className="container-site grid items-center gap-12 py-12 md:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-20 lg:py-20">
          <div>
            <p className="eyebrow">{settings.tagline}</p>
            <h1 className="heading-display mt-4 text-[2rem] leading-[1.35] sm:text-[2.6rem] lg:text-[3.1rem]">
              {settings.heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-[1.02rem] leading-9 text-muted">
              {settings.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/works"
                className="group flex items-center gap-2.5 rounded-xl bg-espresso px-6 py-3.5 font-semibold text-bone transition-colors hover:bg-espresso-2"
              >
                مشاهده نمونه‌کارها
                <ArrowLeftIcon
                  size={18}
                  className="transition-transform group-hover:-translate-x-1"
                />
              </Link>
              <a
                href={`tel:${phoneHref(settings.phone)}`}
                className="flex items-center gap-2.5 rounded-xl border border-line-strong bg-surface px-6 py-3.5 font-semibold text-ink transition-colors hover:border-copper/60 hover:text-copper"
              >
                <PhoneIcon size={18} />
                مشاوره رایگان
              </a>
            </div>
          </div>

          {/* Owner portrait composition */}
          <div className="relative mx-auto w-full max-w-md pb-10 lg:max-w-xl">
            {settings.portrait && (
              <div className="photo-frame relative aspect-[4/5] sm:aspect-[5/5.4]">
                <SmartImage
                  image={settings.portrait}
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 46vw"
                  className="object-cover"
                />
              </div>
            )}
            <div className="absolute bottom-0 end-4 start-4 rounded-xl border border-line bg-surface/95 p-4 shadow-[var(--shadow-card-lg)] backdrop-blur-sm sm:end-auto sm:start-8 sm:max-w-xs">
              <p className="font-display text-lg font-bold">{settings.ownerName}</p>
              <p className="mt-0.5 text-[0.82rem] text-muted">
                سازنده و مجری — همه سفارش‌ها زیر نظر خودم
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-[0.78rem] font-medium text-copper">
                <CheckIcon size={14} />
                {settings.hours ?? "پاسخ‌گویی همه‌روزه"}
              </p>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="border-t border-line">
          <div className="container-site grid grid-cols-3 gap-4 py-6 md:py-7">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
              <p className="font-display text-lg font-bold text-ink md:text-2xl">
                {faNum(settings.experienceYears ?? "15")}
                <span className="text-copper">+</span> سال
              </p>
              <p className="text-[0.8rem] text-muted md:text-[0.88rem]">سابقه کار</p>
            </div>
            <div className="flex flex-col gap-1 justify-self-center sm:flex-row sm:items-baseline sm:gap-3">
              <p className="font-display text-lg font-bold text-ink md:text-2xl">
                رایگان
              </p>
              <p className="text-[0.8rem] text-muted md:text-[0.88rem]">
                مشاوره و برآورد کتبی
              </p>
            </div>
            <div className="flex flex-col gap-1 justify-self-end sm:flex-row sm:items-baseline sm:gap-3">
              <p className="font-display text-lg font-bold text-ink md:text-2xl">
                {settings.serviceArea ?? "تهران"}
              </p>
              <p className="text-[0.8rem] text-muted md:text-[0.88rem]">محدوده خدمات</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Categories ---------- */}
      <section className="border-t border-line bg-cream/55">
        <div className="container-site py-16 md:py-24">
          <SectionHeading
            eyebrow="میان‌بر به نمونه‌کارها"
            title="دنبال چه فضایی هستید؟"
            description="نمونه‌کارها بر اساس نوع فضا دسته‌بندی شده‌اند تا سریع به نمونه‌های نزدیک به سلیقه خودتان برسید."
            href="/works"
            linkLabel="همه نمونه‌کارها"
          />
          <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 scroll-ps-5 [mask-image:linear-gradient(to_right,transparent,black_1.5rem)] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:[mask-image:none] lg:[grid-template-columns:repeat(auto-fit,minmax(13rem,1fr))]">
            {categories.map((category, i) => (
              <Reveal key={category.id} delay={i * 60}>
                <CategoryCard
                  category={category}
                  count={projectsInCategory(content, category.id).length}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Featured projects ---------- */}
      <section className="border-t border-line">
        <div className="container-site py-16 md:py-24">
          <SectionHeading
            eyebrow="گلچینی از کارهای اخیر"
            title="پروژه‌های شاخص"
            description="هر پروژه پاسخی متفاوت به فضا، سلیقه و شیوه استفاده کارفرماست."
            href="/works"
            linkLabel="مشاهده همه"
          />
          <div className="grid gap-x-8 gap-y-12 md:grid-cols-2">
            {shown.map((project, i) => (
              <Reveal
                key={project.id}
                delay={(i % 2) * 80}
                className={`${i % 2 === 1 ? "md:mt-14" : ""} ${
                  i >= 2 ? "hidden md:block" : ""
                }`}
              >
                <ProjectCard
                  project={project}
                  category={categories.find((c) => c.id === project.categoryId)}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Process ---------- */}
      <section className="bg-espresso text-bone">
        <div className="container-site py-16 md:py-24">
          <SectionHeading
            tone="dark"
            eyebrow="از تماس تا نصب"
            title="روند کار چطور پیش می‌رود؟"
          />
          <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
            {[
              {
                icon: <RulerIcon size={22} />,
                title: "بازدید و اندازه‌گیری",
                text: "از فضا بازدید می‌کنم، دقیق اندازه می‌گیرم و درباره نیاز واقعی و بودجه صحبت می‌کنیم.",
              },
              {
                icon: <HammerIcon size={22} />,
                title: "طراحی و ساخت",
                text: "طرح و متریال را با هم نهایی می‌کنیم؛ ساخت با ورق و یراق درست، در کارگاه خودم انجام می‌شود.",
              },
              {
                icon: <TruckIcon size={22} />,
                title: "نصب و تحویل",
                text: "نصب تمیز و بدون کثیف‌کاری در محل؛ تنظیم نهایی درها و کشوها و تحویل کار با تضمین.",
              },
            ].map((step, i) => (
              <Reveal
                key={step.title}
                delay={i * 100}
                as="li"
                className="relative border-t border-bone/15 pt-6"
              >
                <span className="absolute -top-px start-0 h-px w-12 bg-copper" />
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-lg bg-bone/8 text-copper">
                    {step.icon}
                  </span>
                  <span className="font-display text-3xl font-bold text-bone/45">
                    {faNum(`0${i + 1}`)}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">{step.title}</h3>
                <p className="mt-2.5 leading-8 text-bone-dim">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Promises strip ---------- */}
      <section className="border-b border-line bg-cream/55">
        <div className="container-site grid gap-x-8 gap-y-6 py-10 sm:grid-cols-2 md:py-12 lg:grid-cols-4">
          {PRINCIPLES.map((item, i) => (
            <Reveal key={item.title} delay={i * 60}>
              <div className="flex items-start gap-3">
                <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-surface text-copper">
                  <CheckIcon size={14} />
                </span>
                <div>
                  <h3 className="font-display text-[0.98rem] font-semibold">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[0.8rem] leading-6 text-muted">{item.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- About teaser ---------- */}
      <section>
        <div className="container-site grid items-center gap-10 py-16 md:grid-cols-[0.85fr_1.15fr] md:py-24 lg:gap-16">
          {settings.heroImage && (
            <Reveal>
              <div className="photo-frame aspect-[3/2] md:aspect-[4/3]">
                <SmartImage
                  image={settings.heroImage}
                  fill
                  sizes="(max-width: 768px) 100vw, 42vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          )}
          <div>
            <p className="eyebrow">پشت هر قطعه</p>
            <h2 className="heading-section mt-3 text-3xl md:text-4xl">
              جزئیات کوچک، کیفیت نهایی را می‌سازند.
            </h2>
            <p className="mt-5 max-w-xl leading-9 text-muted">{settings.aboutIntro}</p>
            <Link
              href="/about"
              className="group mt-7 inline-flex items-center gap-2 border-b border-copper/40 pb-1 font-semibold text-copper transition-colors hover:border-copper"
            >
              بیشتر درباره من و روش کارم
              <ArrowLeftIcon
                size={17}
                className="transition-transform group-hover:-translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>

      <ContactBand settings={settings} />
    </>
  );
}
