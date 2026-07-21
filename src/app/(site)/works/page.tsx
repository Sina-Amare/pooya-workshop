import type { Metadata } from "next";
import { Suspense } from "react";
import ContactBand from "@/components/site/ContactBand";
import WorksExplorer from "@/components/site/WorksExplorer";
import { getContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "نمونه‌کارها",
  description:
    "گالری کامل نمونه‌کارهای کابینت آشپزخانه، کمد دیواری، کافی‌بار و مصنوعات چوبی سفارشی.",
};

export default async function WorksPage() {
  const content = await getContent();
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="container-site py-12 md:py-16">
          <p className="eyebrow">گالری کارهای اجراشده</p>
          <h1 className="heading-display mt-3 text-3xl md:text-5xl">نمونه‌کارها</h1>
          <p className="mt-4 max-w-2xl leading-8 text-muted">
            هر پروژه برای فضای واقعی یک خانه طراحی و ساخته شده است. با فیلتر
            دسته‌بندی، سریع به نمونه‌های نزدیک به نیاز خودتان برسید.
          </p>
        </div>
      </section>
      <Suspense>
        <WorksExplorer
          projects={content.projects}
          categories={content.categories}
        />
      </Suspense>
      <ContactBand
        settings={content.settings}
        title="کار مشابهی برای خانه‌تان می‌خواهید؟"
        description="عکس فضا را در واتساپ بفرستید یا تماس بگیرید؛ درباره طرح، متریال و هزینه، شفاف راهنمایی‌تان می‌کنم."
      />
    </>
  );
}
