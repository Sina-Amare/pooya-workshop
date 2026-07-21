"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  GridIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/icons";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import ImageUploader from "@/components/admin/ImageUploader";
import { useToast } from "@/components/admin/Toast";
import { Button, Card, Field, TextInput } from "@/components/admin/ui";
import { apiFetch } from "@/lib/client/api";
import { faNum } from "@/lib/fa";
import type { Category, Project } from "@/lib/types";

interface Props {
  initialCategories: Category[];
  projects: Project[];
}

interface EditorState {
  id: string | null; // null = creating
  title: string;
  description: string;
  cover: Category["cover"];
}

export default function CategoriesManager({ initialCategories, projects }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [categories, setCategories] = useState(initialCategories);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [busy, setBusy] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);

  const projectCount = (id: string) =>
    projects.filter((p) => p.categoryId === id).length;

  async function persistOrder(next: Category[]) {
    const previous = categories;
    setCategories(next);
    setSavingOrder(true);
    try {
      await apiFetch("/api/admin/categories", {
        method: "PUT",
        body: JSON.stringify({ ids: next.map((c) => c.id) }),
      });
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "ترتیب ذخیره نشد؛ دوباره امتحان کنید.", "error");
      setCategories(previous);
    } finally {
      setSavingOrder(false);
    }
  }

  function move(index: number, direction: -1 | 1) {
    if (savingOrder) return;
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const next = [...categories];
    [next[index], next[target]] = [next[target], next[index]];
    void persistOrder(next);
  }

  async function save() {
    if (!editor) return;
    if (!editor.title.trim()) {
      toast("اسم دسته را بنویسید.", "error");
      return;
    }
    setBusy(true);
    try {
      if (editor.id) {
        const updated = await apiFetch<Category>(
          `/api/admin/categories/${editor.id}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              title: editor.title,
              description: editor.description,
              cover: editor.cover ?? null,
            }),
          },
        );
        setCategories((prev) =>
          prev.map((c) => (c.id === editor.id ? updated : c)),
        );
        toast("دسته ویرایش شد.");
      } else {
        const created = await apiFetch<Category>("/api/admin/categories", {
          method: "POST",
          body: JSON.stringify({
            title: editor.title,
            description: editor.description,
            cover: editor.cover,
          }),
        });
        setCategories((prev) => [...prev, created]);
        toast("دسته جدید اضافه شد.");
      }
      setEditor(null);
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "ذخیره نشد؛ دوباره امتحان کنید.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove(category: Category) {
    setBusy(true);
    try {
      await apiFetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      toast("دسته حذف شد.");
      setConfirmDelete(null);
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "حذف نشد؛ دوباره امتحان کنید.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {editor && (
        <Card title={editor.id ? "ویرایش دسته" : "دسته جدید"}>
          <div className="space-y-4">
            <Field label="اسم دسته" required>
              <TextInput
                value={editor.title}
                onChange={(e) =>
                  setEditor((prev) => (prev ? { ...prev, title: e.target.value } : prev))
                }
                placeholder="مثلاً: کابینت آشپزخانه"
                autoFocus
              />
            </Field>
            <Field label="توضیح کوتاه" hint="اختیاری">
              <TextInput
                value={editor.description}
                onChange={(e) =>
                  setEditor((prev) =>
                    prev ? { ...prev, description: e.target.value } : prev,
                  )
                }
                placeholder="یک جمله درباره این دسته"
              />
            </Field>
            <ImageUploader
              images={editor.cover ? [editor.cover] : []}
              onChange={(imgs) =>
                setEditor((prev) => (prev ? { ...prev, cover: imgs[0] } : prev))
              }
              multiple={false}
              label="عکس دسته"
              hint="در صفحه اول نمایش داده می‌شود"
            />
            <div className="flex gap-3 pt-1">
              <Button busy={busy} onClick={save} className="flex-1">
                {editor.id ? "ذخیره تغییرات" : "ثبت دسته"}
              </Button>
              <Button variant="secondary" onClick={() => setEditor(null)}>
                انصراف
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {categories.map((category, i) => (
          <div
            key={category.id}
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
                disabled={i === categories.length - 1 || savingOrder}
                className="grid size-8 place-items-center rounded-md border border-line text-muted transition-colors hover:border-copper/60 hover:text-copper disabled:opacity-30"
                aria-label="انتقال به پایین"
              >
                <ChevronDownIcon size={15} />
              </button>
            </div>

            <div className="relative hidden h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-cream sm:block">
              {category.cover ? (
                <Image
                  src={category.cover.src}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <span className="grid h-full place-items-center text-muted">
                  <GridIcon size={18} />
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate font-display text-[1.02rem] font-bold">
                {category.title}
              </h2>
              <p className="mt-0.5 text-[0.8rem] text-muted">
                {faNum(projectCount(category.id))} کار
              </p>
            </div>

            <div className="flex shrink-0 gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setEditor({
                    id: category.id,
                    title: category.title,
                    description: category.description ?? "",
                    cover: category.cover,
                  })
                }
                className="grid size-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-copper/60 hover:text-copper"
                title="ویرایش"
                aria-label={`ویرایش ${category.title}`}
              >
                <PencilIcon size={16} />
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(category)}
                className="grid size-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-[#c8574a] hover:bg-[#a03325] hover:text-white"
                title="حذف"
                aria-label={`حذف ${category.title}`}
              >
                <TrashIcon size={16} />
              </button>
            </div>
          </div>
        ))}

        {!editor && (
          <button
            type="button"
            onClick={() => setEditor({ id: null, title: "", description: "", cover: undefined })}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line-strong py-5 font-semibold text-muted transition-colors hover:border-copper/60 hover:text-copper"
          >
            <PlusIcon size={18} />
            دسته جدید
          </button>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title={`حذف «${confirmDelete?.title ?? ""}»؟`}
        description={
          confirmDelete && projectCount(confirmDelete.id) > 0
            ? `این دسته ${faNum(projectCount(confirmDelete.id))} کار دارد؛ اول باید کارهایش را جابه‌جا یا حذف کنید.`
            : "این دسته برای همیشه حذف می‌شود."
        }
        busy={busy}
        confirmDisabled={Boolean(confirmDelete && projectCount(confirmDelete.id) > 0)}
        onConfirm={() => confirmDelete && remove(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  );
}
