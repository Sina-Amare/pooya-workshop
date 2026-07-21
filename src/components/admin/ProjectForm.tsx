"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckIcon, ChevronDownIcon, PlusIcon } from "@/components/icons";
import ImageUploader from "@/components/admin/ImageUploader";
import { useToast } from "@/components/admin/Toast";
import {
  Button,
  Card,
  Field,
  TextArea,
  TextInput,
  Toggle,
} from "@/components/admin/ui";
import { apiFetch } from "@/lib/client/api";
import type { Category, ImageRef, Project } from "@/lib/types";

interface Props {
  categories: Category[];
  project?: Project;
}

export default function ProjectForm({ categories: initialCategories, project }: Props) {
  const router = useRouter();
  const toast = useToast();
  const editing = Boolean(project);

  const [categories, setCategories] = useState(initialCategories);
  const [title, setTitle] = useState(project?.title ?? "");
  const [categoryId, setCategoryId] = useState(
    project?.categoryId ?? initialCategories[0]?.id ?? "",
  );
  const [images, setImages] = useState<ImageRef[]>(project?.images ?? []);
  const [summary, setSummary] = useState(project?.summary ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [materials, setMaterials] = useState(project?.materials?.join("، ") ?? "");
  const [location, setLocation] = useState(project?.location ?? "");
  const [year, setYear] = useState(project?.year ?? "");
  const [featured, setFeatured] = useState(project?.featured ?? false);
  const [busy, setBusy] = useState(false);

  // Inline "new category" mini-form
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  async function createCategory() {
    const name = newCategoryName.trim();
    if (!name) {
      toast("اسم دسته را بنویسید.", "error");
      return;
    }
    setCreatingCategory(true);
    try {
      const created = await apiFetch<Category>("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify({ title: name }),
      });
      setCategories((prev) => [...prev, created]);
      setCategoryId(created.id);
      setAddingCategory(false);
      setNewCategoryName("");
      toast(`دسته «${created.title}» اضافه شد.`);
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "دسته اضافه نشد؛ دوباره امتحان کنید.", "error");
    } finally {
      setCreatingCategory(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast("اسم کار را بنویسید.", "error");
      return;
    }
    if (!categoryId) {
      toast("دسته کار را انتخاب کنید.", "error");
      return;
    }
    setBusy(true);
    const payload = {
      title,
      categoryId,
      summary,
      description,
      materials: materials
        .split(/[،,]/)
        .map((m) => m.trim())
        .filter(Boolean),
      location,
      year,
      featured,
      images,
    };
    try {
      if (editing) {
        await apiFetch(`/api/admin/projects/${project!.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast("تغییرات ذخیره شد و روی سایت رفت.");
      } else {
        await apiFetch("/api/admin/projects", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast("کار جدید ذخیره شد و روی سایت رفت.");
      }
      router.push("/admin/projects");
      router.refresh();
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "ذخیره نشد؛ دوباره امتحان کنید.",
        "error",
      );
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-5">
      <Card>
        <div className="space-y-6">
          <Field label="اسم کار" required hint="همین اسم روی سایت نمایش داده می‌شود">
            <TextInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً: آشپزخانه سفید و گردو"
              className="py-3 text-base"
              required
            />
          </Field>

          <div>
            <p className="mb-2 text-[0.88rem] font-semibold">
              این کار در کدام دسته است؟ <span className="text-copper">*</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const selected = categoryId === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setCategoryId(category.id)}
                    aria-pressed={selected}
                    className={`flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-[0.92rem] font-semibold transition-colors ${
                      selected
                        ? "border-espresso bg-espresso text-bone"
                        : "border-line-strong bg-surface text-ink hover:border-copper/60"
                    }`}
                  >
                    {selected && <CheckIcon size={15} />}
                    {category.title}
                  </button>
                );
              })}
              {!addingCategory && (
                <button
                  type="button"
                  onClick={() => setAddingCategory(true)}
                  className="flex items-center gap-1.5 rounded-full border-2 border-dashed border-line-strong px-4 py-2.5 text-[0.92rem] font-semibold text-muted transition-colors hover:border-copper/60 hover:text-copper"
                >
                  <PlusIcon size={15} />
                  دسته جدید
                </button>
              )}
            </div>
            {addingCategory && (
              <div className="mt-3 flex gap-2">
                <TextInput
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="اسم دسته جدید"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void createCategory();
                    }
                  }}
                />
                <Button
                  busy={creatingCategory}
                  onClick={createCategory}
                  className="shrink-0 whitespace-nowrap"
                >
                  اضافه کن
                </Button>
                <Button
                  variant="ghost"
                  className="shrink-0 whitespace-nowrap"
                  onClick={() => {
                    setAddingCategory(false);
                    setNewCategoryName("");
                  }}
                >
                  انصراف
                </Button>
              </div>
            )}
          </div>

          <ImageUploader
            images={images}
            onChange={setImages}
            label="عکس‌های کار"
            hint="اولین عکس، عکس اصلی است"
          />
        </div>
      </Card>

      <details className="group rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)]">
        <summary className="cursor-pointer list-none rounded-2xl p-5 font-display text-lg font-bold transition-colors hover:bg-cream/40 sm:p-6">
          <span className="flex items-center justify-between gap-3">
            توضیحات بیشتر
            <span className="flex items-center gap-3">
              <span className="hidden text-[0.8rem] font-normal text-muted sm:inline">
                اختیاری — می‌توانید خالی بگذارید
              </span>
              <ChevronDownIcon
                size={18}
                className="shrink-0 text-muted transition-transform group-open:rotate-180"
              />
            </span>
          </span>
        </summary>
        <div className="space-y-4 border-t border-line p-5 sm:p-6">
          <Field label="یک جمله درباره این کار">
            <TextInput
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="مثلاً: کابینت بدون دستگیره با جزیره گردویی"
            />
          </Field>
          <Field label="توضیح کامل">
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="هر چیزی که دوست دارید مشتری درباره این کار بداند…"
            />
          </Field>
          <Field label="جنس و متریال" hint="با ویرگول جدا کنید">
            <TextInput
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
              placeholder="ام‌دی‌اف مات، روکش گردو"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="محل اجرا">
              <TextInput
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="تهران"
              />
            </Field>
            <Field label="سال ساخت">
              <TextInput
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="۱۴۰۵"
              />
            </Field>
          </div>
        </div>
      </details>

      <Toggle
        checked={featured}
        onChange={setFeatured}
        label="نمایش در صفحه اول سایت"
        description="این گزینه را برای بهترین کارهایتان روشن کنید تا اول از همه دیده شوند"
      />

      <div className="flex gap-3">
        <Button type="submit" busy={busy} className="flex-1 py-3.5 text-base">
          {editing ? "ذخیره تغییرات" : "ذخیره کار"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => router.push("/admin/projects")}
          className="py-3.5"
        >
          انصراف
        </Button>
      </div>
    </form>
  );
}
