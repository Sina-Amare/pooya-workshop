import Link from "next/link";
import { redirect } from "next/navigation";
import ProjectForm from "@/components/admin/ProjectForm";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const content = await getContent();
  if (content.categories.length === 0) redirect("/admin/categories");

  return (
    <div className="space-y-5">
      <div className="mx-auto max-w-2xl">
        <nav className="text-[0.82rem] text-muted">
          <Link href="/admin/projects" className="hover:text-copper">
            کارهای من
          </Link>{" "}
          / کار جدید
        </nav>
        <h1 className="heading-section mt-1 text-2xl">اضافه کردن کار جدید</h1>
      </div>
      <ProjectForm categories={content.categories} />
    </div>
  );
}
