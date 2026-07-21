"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import ProjectCard from "@/components/site/ProjectCard";
import type { Category, Project } from "@/lib/types";

interface Props {
  projects: Project[];
  categories: Category[];
}

export default function WorksExplorer({ projects, categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get("cat") ?? "";
  const [active, setActive] = useState(initial);

  const filtered = useMemo(() => {
    if (!active) return projects;
    const category = categories.find((c) => c.slug === active);
    if (!category) return projects;
    return projects.filter((p) => p.categoryId === category.id);
  }, [active, projects, categories]);

  function select(slug: string) {
    setActive(slug);
    const url = slug ? `/works?cat=${encodeURIComponent(slug)}` : "/works";
    router.replace(url, { scroll: false });
  }

  const chipClass = (selected: boolean) =>
    `shrink-0 rounded-full border px-4 py-2 text-[0.88rem] font-medium transition-colors ${
      selected
        ? "border-espresso bg-espresso text-bone"
        : "border-line-strong bg-surface text-ink hover:border-copper/60 hover:text-copper"
    }`;

  return (
    <section className="container-site py-10 md:py-14">
      <div
        className="sticky top-16 z-30 -mx-5 mb-10 border-b border-line bg-paper/95 px-5 py-4 backdrop-blur-md sm:mx-0 sm:px-0 md:top-[4.5rem]"
        role="group"
        aria-label="فیلتر دسته‌بندی نمونه‌کارها"
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={active === ""}
            onClick={() => select("")}
            className={chipClass(active === "")}
          >
            همه کارها
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              aria-pressed={active === category.slug}
              onClick={() => select(category.slug)}
              className={chipClass(active === category.slug)}
            >
              {category.title}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line-strong py-20 text-center">
          <p className="font-display text-xl font-semibold">
            هنوز نمونه‌کاری در این دسته ثبت نشده است.
          </p>
          <p className="mt-2 text-muted">
            به‌زودی کارهای جدید اضافه می‌شود؛ دسته‌های دیگر را ببینید.
          </p>
          <button
            type="button"
            onClick={() => select("")}
            className="mt-6 rounded-lg border border-copper px-5 py-2.5 font-semibold text-copper transition-colors hover:bg-copper hover:text-white"
          >
            نمایش همه کارها
          </button>
        </div>
      ) : (
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              category={categories.find((c) => c.id === project.categoryId)}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priorityImage={i < 3}
            />
          ))}
        </div>
      )}
    </section>
  );
}
