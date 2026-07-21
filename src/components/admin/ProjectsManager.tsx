"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ImageIcon,
  PencilIcon,
  StarIcon,
  TrashIcon,
} from "@/components/icons";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { apiFetch } from "@/lib/client/api";
import { faNum } from "@/lib/fa";
import type { Category, Project } from "@/lib/types";

interface Props {
  initialProjects: Project[];
  categories: Category[];
}

export default function ProjectsManager({ initialProjects, categories }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [projects, setProjects] = useState(initialProjects);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);

  const categoryTitle = (id: string) =>
    categories.find((c) => c.id === id)?.title ?? "—";

  async function persistOrder(next: Project[]) {
    const previous = projects;
    setProjects(next);
    setSavingOrder(true);
    try {
      await apiFetch("/api/admin/projects", {
        method: "PUT",
        body: JSON.stringify({ ids: next.map((p) => p.id) }),
      });
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "ترتیب ذخیره نشد؛ دوباره امتحان کنید.", "error");
      setProjects(previous);
    } finally {
      setSavingOrder(false);
    }
  }

  function move(index: number, direction: -1 | 1) {
    if (savingOrder) return;
    const target = index + direction;
    if (target < 0 || target >= projects.length) return;
    const next = [...projects];
    [next[index], next[target]] = [next[target], next[index]];
    void persistOrder(next);
  }

  async function toggleFeatured(project: Project) {
    setBusyId(project.id);
    try {
      const updated = await apiFetch<Project>(`/api/admin/projects/${project.id}`, {
        method: "PATCH",
        body: JSON.stringify({ featured: !project.featured }),
      });
      setProjects((prev) => prev.map((p) => (p.id === project.id ? updated : p)));
      toast(
        updated.featured
          ? "این کار حالا در صفحه اول سایت نمایش داده می‌شود."
          : "این کار دیگر در صفحه اول نیست.",
      );
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "ذخیره نشد؛ دوباره امتحان کنید.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(project: Project) {
    setBusyId(project.id);
    try {
      await apiFetch(`/api/admin/projects/${project.id}`, { method: "DELETE" });
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      toast("کار حذف شد.");
      setConfirmDelete(null);
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "حذف نشد؛ دوباره امتحان کنید.", "error");
    } finally {
      setBusyId(null);
    }
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line-strong bg-surface py-16 text-center">
        <ImageIcon size={36} className="mx-auto text-line-strong" />
        <p className="mt-4 font-display text-lg font-bold">هنوز کاری اضافه نشده</p>
        <p className="mt-1.5 text-[0.88rem] text-muted">
          اولین کارتان را اضافه کنید تا سایت جان بگیرد.
        </p>
        <Link
          href="/admin/projects/new"
          className="mt-6 inline-block rounded-lg bg-espresso px-5 py-2.5 font-semibold text-bone"
        >
          اضافه کردن اولین کار
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-3">
        {projects.map((project, i) => {
          const cover = project.images[0];
          return (
            <li
              key={project.id}
              className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-3 sm:p-4"
            >
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0 || savingOrder}
                  className="grid size-8 place-items-center rounded-md border border-line text-muted transition-colors hover:border-copper/60 hover:text-copper disabled:opacity-30"
                  aria-label="انتقال به بالا"
                >
                  <ChevronUpIcon size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === projects.length - 1 || savingOrder}
                  className="grid size-8 place-items-center rounded-md border border-line text-muted transition-colors hover:border-copper/60 hover:text-copper disabled:opacity-30"
                  aria-label="انتقال به پایین"
                >
                  <ChevronDownIcon size={15} />
                </button>
              </div>

              <div className="relative hidden h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-cream sm:block">
                {cover ? (
                  <Image
                    src={cover.src}
                    alt=""
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                ) : (
                  <span className="grid h-full place-items-center text-muted">
                    <ImageIcon size={20} />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="line-clamp-2 font-display text-[1.05rem] font-bold leading-7">
                  {project.title}
                </h2>
                <p className="mt-1 text-[0.8rem] text-muted">
                  {categoryTitle(project.categoryId)} · {faNum(project.images.length)}{" "}
                  عکس
                  {project.year ? ` · ${faNum(project.year)}` : ""}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleFeatured(project)}
                  disabled={busyId === project.id}
                  className={`grid size-9 place-items-center rounded-lg border transition-colors ${
                    project.featured
                      ? "border-copper bg-copper text-white"
                      : "border-line text-muted hover:border-copper/60 hover:text-copper"
                  }`}
                  title={project.featured ? "برداشتن از صفحه اول" : "نمایش در صفحه اول"}
                  aria-label={project.featured ? "برداشتن از صفحه اول" : "نمایش در صفحه اول"}
                >
                  <StarIcon size={16} />
                </button>
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="grid size-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-copper/60 hover:text-copper"
                  title="ویرایش"
                  aria-label={`ویرایش ${project.title}`}
                >
                  <PencilIcon size={16} />
                </Link>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(project)}
                  disabled={busyId === project.id}
                  className="grid size-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-[#c8574a] hover:bg-[#a03325] hover:text-white"
                  title="حذف"
                  aria-label={`حذف ${project.title}`}
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title={`حذف «${confirmDelete?.title ?? ""}»؟`}
        description="این کار و همه عکس‌هایش برای همیشه حذف می‌شوند و دیگر قابل بازگرداندن نیستند."
        busy={Boolean(confirmDelete && busyId === confirmDelete.id)}
        onConfirm={() => confirmDelete && remove(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}
