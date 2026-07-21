import Link from "next/link";
import CategoriesManager from "@/components/admin/CategoriesManager";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const content = await getContent();
  return (
    <div className="space-y-5">
      <div>
        <nav className="text-[0.82rem] text-muted">
          <Link href="/admin/projects" className="hover:text-copper">
            کارهای من
          </Link>{" "}
          / دسته‌ها
        </nav>
        <h1 className="heading-section mt-1 text-2xl">دسته‌های کار</h1>
        <p className="mt-1 text-[0.88rem] text-muted">
          کارها در سایت بر اساس این دسته‌ها جدا می‌شوند؛ مثلاً کابینت، کمد، کافی‌بار.
        </p>
      </div>
      <CategoriesManager
        initialCategories={content.categories}
        projects={content.projects}
      />
    </div>
  );
}
