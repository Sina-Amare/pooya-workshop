import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectForm from "@/components/admin/ProjectForm";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const content = await getContent();
  const project = content.projects.find((p) => p.id === id);
  if (!project) notFound();

  return (
    <div className="space-y-5">
      <div className="mx-auto max-w-2xl">
        <nav className="text-[0.82rem] text-muted">
          <Link href="/admin/projects" className="hover:text-copper">
            کارهای من
          </Link>{" "}
          / ویرایش
        </nav>
        <h1 className="heading-section mt-1 text-2xl">ویرایش «{project.title}»</h1>
      </div>
      <ProjectForm categories={content.categories} project={project} />
    </div>
  );
}
