import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContactBand from "@/components/site/ContactBand";
import ProjectCard from "@/components/site/ProjectCard";
import ProjectGallery from "@/components/site/ProjectGallery";
import SectionHeading from "@/components/site/SectionHeading";
import { findProject, getContent, projectsInCategory } from "@/lib/content";
import { faNum } from "@/lib/fa";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const content = await getContent();
  return content.projects.map((p) => ({ slug: p.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent();
  const project = findProject(content, slug);
  if (!project) return { title: "پیدا نشد" };
  return {
    title: project.title,
    description: project.summary ?? project.description,
    openGraph: project.images[0]
      ? { images: [{ url: project.images[0].src }] }
      : undefined,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const content = await getContent();
  const project = findProject(content, slug);
  if (!project) notFound();

  const category = content.categories.find((c) => c.id === project.categoryId);
  const related = category
    ? projectsInCategory(content, category.id)
        .filter((p) => p.id !== project.id)
        .slice(0, 2)
    : [];

  const cover = project.images[0];
  const portraitCover = Boolean(cover && cover.height > cover.width);

  const meta: Array<{ label: string; value: string }> = [
    category ? { label: "دسته‌بندی", value: category.title } : null,
    project.location ? { label: "محل اجرا", value: project.location } : null,
    project.year ? { label: "سال ساخت", value: faNum(project.year) } : null,
    project.materials?.length
      ? { label: "متریال", value: project.materials.join("، ") }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <>
      <article>
        <header className="border-b border-line bg-surface">
          <div className="container-site py-10 md:py-14">
            <nav className="flex items-center gap-2 text-[0.85rem] text-muted" aria-label="مسیر">
              <Link href="/works" className="transition-colors hover:text-copper">
                نمونه‌کارها
              </Link>
              {category && (
                <>
                  <span>/</span>
                  <Link
                    href={`/works?cat=${encodeURIComponent(category.slug)}`}
                    className="transition-colors hover:text-copper"
                  >
                    {category.title}
                  </Link>
                </>
              )}
            </nav>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <h1 className="heading-display text-3xl md:text-[2.6rem]">
                  {project.title}
                </h1>
                {project.summary && (
                  <p className="mt-4 leading-8 text-muted">{project.summary}</p>
                )}
              </div>
              <dl className="grid min-w-64 grid-cols-2 gap-x-8 gap-y-3">
                {meta.map((m) => (
                  <div key={m.label}>
                    <dt className="text-[0.72rem] text-muted">{m.label}</dt>
                    <dd className="mt-0.5 text-[0.9rem] font-semibold">{m.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </header>

        <div className="container-site py-10 md:py-14">
          {portraitCover && project.description ? (
            // Portrait photos would leave big empty flanks; use the space for the story.
            <div className="grid items-start gap-10 md:grid-cols-[minmax(0,44rem)_1fr] md:gap-14">
              <ProjectGallery images={project.images} title={project.title} />
              <div className="md:sticky md:top-28">
                <h2 className="heading-section text-2xl">درباره این پروژه</h2>
                <p className="mt-4 whitespace-pre-line text-start leading-9 text-ink-2">
                  {project.description}
                </p>
              </div>
            </div>
          ) : (
            <>
              <ProjectGallery images={project.images} title={project.title} />
              {project.description && (
                <div className="mt-12 max-w-3xl md:mt-16">
                  <h2 className="heading-section text-2xl">درباره این پروژه</h2>
                  <p className="mt-4 whitespace-pre-line text-start leading-9 text-ink-2">
                    {project.description}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-line bg-surface">
          <div className="container-site py-14 md:py-20">
            <SectionHeading
              eyebrow="کارهای مشابه"
              title={`نمونه‌های دیگر ${category?.title ?? ""}`}
              href={
                category
                  ? `/works?cat=${encodeURIComponent(category.slug)}`
                  : "/works"
              }
              linkLabel="مشاهده همه"
            />
            <div
              className={
                related.length > 1
                  ? "grid gap-x-8 gap-y-10 md:grid-cols-2"
                  : "grid max-w-xl"
              }
            >
              {related.map((p) => (
                <ProjectCard key={p.id} project={p} category={category} />
              ))}
            </div>
          </div>
        </section>
      )}

      <ContactBand
        settings={content.settings}
        title="فضای مشابهی در خانه دارید؟"
        description="عکس فضا را در واتساپ بفرستید یا تماس بگیرید؛ درباره طرح، متریال و هزینه، شفاف راهنمایی‌تان می‌کنم."
      />

    </>
  );
}
