import Link from "next/link";
import SmartImage from "@/components/site/SmartImage";
import { faNum } from "@/lib/fa";
import type { Category, Project } from "@/lib/types";

interface Props {
  project: Project;
  category?: Category;
  sizes?: string;
  priorityImage?: boolean;
}

export default function ProjectCard({ project, category, sizes, priorityImage }: Props) {
  const cover = project.images[0];
  return (
    <Link href={`/works/${encodeURIComponent(project.slug)}`} className="group block">
      <div className="photo-frame aspect-[3/2]">
        {cover ? (
          <SmartImage
            image={cover}
            fill
            priority={priorityImage}
            sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center text-muted">بدون تصویر</div>
        )}
      </div>
      <div className="pt-4">
        <div className="flex items-center gap-3 text-[0.78rem] font-medium text-copper">
          {category && <span>{category.title}</span>}
          {category && (project.year || project.location) && (
            <span className="size-1 rounded-full bg-line-strong" />
          )}
          <span className="text-muted">
            {[project.location, project.year && faNum(project.year)]
              .filter(Boolean)
              .join("، ")}
          </span>
        </div>
        <h3 className="heading-section mt-1.5 text-xl transition-colors group-hover:text-copper md:text-[1.35rem]">
          {project.title}
        </h3>
        {project.summary && (
          <p className="mt-2 line-clamp-2 text-[0.88rem] leading-7 text-muted">
            {project.summary}
          </p>
        )}
      </div>
    </Link>
  );
}
