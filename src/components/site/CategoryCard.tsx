import Link from "next/link";
import SmartImage from "@/components/site/SmartImage";
import { faNum } from "@/lib/fa";
import type { Category } from "@/lib/types";

interface Props {
  category: Category;
  count: number;
}

export default function CategoryCard({ category, count }: Props) {
  return (
    <Link
      href={`/works?cat=${encodeURIComponent(category.slug)}`}
      className="group block w-[16.5rem] shrink-0 snap-start sm:w-auto sm:shrink"
    >
      <div className="photo-frame aspect-[4/5]">
        {category.cover && (
          <SmartImage
            image={category.cover}
            fill
            sizes="(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 20vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        )}
        {count >= 3 && (
          <span className="absolute top-3 start-3 rounded-full bg-espresso/80 px-2.5 py-1 text-[0.72rem] font-medium text-bone backdrop-blur-sm">
            {faNum(count)} پروژه
          </span>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-3 border-b border-line pb-4 pt-3.5 transition-colors group-hover:border-copper/60">
        <h3 className="font-display text-[1.05rem] font-semibold group-hover:text-copper">
          {category.title}
        </h3>
      </div>
      {category.description && (
        <p className="mt-2 line-clamp-2 text-[0.82rem] leading-6 text-muted">
          {category.description}
        </p>
      )}
    </Link>
  );
}
