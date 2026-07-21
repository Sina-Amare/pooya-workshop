import Link from "next/link";
import { GridIcon, PlusIcon } from "@/components/icons";
import ProjectsManager from "@/components/admin/ProjectsManager";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const content = await getContent();
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="heading-section text-2xl">کارهای من</h1>
          <p className="mt-1 text-[0.88rem] text-muted">
            با فلش‌های بالا و پایین، ترتیب نمایش در سایت را عوض کنید.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/categories"
            className="flex items-center gap-2 rounded-lg border border-line-strong px-4 py-2.5 text-[0.92rem] font-semibold transition-colors hover:border-copper/60 hover:text-copper"
          >
            <GridIcon size={17} />
            دسته‌ها
          </Link>
          <Link
            href="/admin/projects/new"
            className="flex items-center gap-2 rounded-lg bg-espresso px-4 py-2.5 text-[0.92rem] font-semibold text-bone transition-colors hover:bg-espresso-2"
          >
            <PlusIcon size={17} />
            کار جدید
          </Link>
        </div>
      </div>
      <ProjectsManager
        initialProjects={content.projects}
        categories={content.categories}
      />
    </div>
  );
}
