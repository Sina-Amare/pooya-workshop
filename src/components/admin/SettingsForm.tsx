"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import ImageUploader from "@/components/admin/ImageUploader";
import { useToast } from "@/components/admin/Toast";
import { Button, Card, Field, TextArea, TextInput } from "@/components/admin/ui";
import { apiFetch } from "@/lib/client/api";
import type { SiteSettings } from "@/lib/types";

export default function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiFetch("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify({
          ...form,
          portrait: form.portrait ?? null,
          heroImage: form.heroImage ?? null,
        }),
      });
      toast("ذخیره شد و روی سایت رفت.");
      router.push("/admin");
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "ذخیره نشد؛ دوباره امتحان کنید.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-5">
      <Card title="عکس و اسم شما">
        <div className="space-y-5">
          <ImageUploader
            images={form.portrait ? [form.portrait] : []}
            onChange={(imgs) => set("portrait", imgs[0])}
            multiple={false}
            label="عکس شما"
            hint="بالای صفحه اول سایت، بزرگ نمایش داده می‌شود"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="اسم شما" required>
              <TextInput
                value={form.ownerName}
                onChange={(e) => set("ownerName", e.target.value)}
                required
              />
            </Field>
            <Field label="اسم کسب‌وکار" required>
              <TextInput
                value={form.businessName}
                onChange={(e) => set("businessName", e.target.value)}
                required
              />
            </Field>
          </div>
          <Field label="چند سال سابقه کار دارید؟">
            <TextInput
              value={form.experienceYears ?? ""}
              onChange={(e) => set("experienceYears", e.target.value)}
              placeholder="15"
              dir="ltr"
              inputMode="numeric"
              className="max-w-32"
            />
          </Field>
        </div>
      </Card>

      <Card title="راه‌های تماس">
        <div className="space-y-4">
          <Field label="شماره تلفن" required hint="مشتری‌ها با همین شماره تماس می‌گیرند">
            <TextInput
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="09123456789"
              dir="ltr"
              inputMode="tel"
              className="py-3 text-base"
              required
            />
          </Field>
          <Field label="شماره واتساپ" hint="اگر خالی باشد، دکمه واتساپ از سایت حذف می‌شود">
            <TextInput
              value={form.whatsapp ?? ""}
              onChange={(e) => set("whatsapp", e.target.value)}
              placeholder="09123456789"
              dir="ltr"
              inputMode="tel"
            />
          </Field>
          <Field label="آیدی اینستاگرام" hint="بدون @">
            <TextInput
              value={form.instagram ?? ""}
              onChange={(e) => set("instagram", e.target.value)}
              placeholder="pooyachoob"
              dir="ltr"
            />
          </Field>
          <Field label="نشانی یا محدوده کارگاه">
            <TextInput
              value={form.address ?? ""}
              onChange={(e) => set("address", e.target.value)}
              placeholder="تهران — بازدید با هماهنگی قبلی"
            />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="کجاها کار می‌کنید؟">
              <TextInput
                value={form.serviceArea ?? ""}
                onChange={(e) => set("serviceArea", e.target.value)}
                placeholder="تهران و حومه"
              />
            </Field>
            <Field label="ساعت پاسخ‌گویی">
              <TextInput
                value={form.hours ?? ""}
                onChange={(e) => set("hours", e.target.value)}
                placeholder="شنبه تا پنج‌شنبه، ۹ تا ۱۸"
              />
            </Field>
          </div>
        </div>
      </Card>

      <details className="group rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)]">
        <summary className="cursor-pointer list-none rounded-2xl p-5 font-display text-lg font-bold transition-colors hover:bg-cream/40 sm:p-6">
          <span className="flex items-center justify-between gap-3">
            متن‌های سایت
            <span className="flex items-center gap-3">
              <span className="hidden text-[0.8rem] font-normal text-muted sm:inline">
                اختیاری — متن‌های فعلی آماده و مناسب‌اند
              </span>
              <ChevronDownIcon
                size={18}
                className="shrink-0 text-muted transition-transform group-open:rotate-180"
              />
            </span>
          </span>
        </summary>
        <div className="space-y-4 border-t border-line p-5 sm:p-6">
          <Field label="شعار زیر اسم سایت">
            <TextInput
              value={form.tagline}
              onChange={(e) => set("tagline", e.target.value)}
            />
          </Field>
          <Field label="تیتر بزرگ صفحه اول">
            <TextArea
              rows={2}
              value={form.heroTitle}
              onChange={(e) => set("heroTitle", e.target.value)}
            />
          </Field>
          <Field label="توضیح زیر تیتر">
            <TextArea
              rows={3}
              value={form.heroSubtitle}
              onChange={(e) => set("heroSubtitle", e.target.value)}
            />
          </Field>
          <Field label="معرفی کوتاه شما" hint="در میانه صفحه اول">
            <TextArea
              rows={3}
              value={form.aboutIntro}
              onChange={(e) => set("aboutIntro", e.target.value)}
            />
          </Field>
          <Field
            label="معرفی کامل"
            hint="در صفحه «درباره من» — با یک خط خالی، پاراگراف جدا کنید"
          >
            <TextArea
              rows={7}
              value={form.aboutBody}
              onChange={(e) => set("aboutBody", e.target.value)}
            />
          </Field>
          <ImageUploader
            images={form.heroImage ? [form.heroImage] : []}
            onChange={(imgs) => set("heroImage", imgs[0])}
            multiple={false}
            label="عکس بخش معرفی"
            hint="یک عکس افقی از بهترین کارتان"
          />
        </div>
      </details>

      <Button type="submit" busy={busy} className="w-full py-3.5 text-base">
        ذخیره همه تنظیمات
      </Button>
    </form>
  );
}
