"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
  UploadIcon,
} from "@/components/icons";
import { useToast } from "@/components/admin/Toast";
import { Spinner } from "@/components/admin/ui";
import { apiFetch } from "@/lib/client/api";
import { compressImage } from "@/lib/client/compress";
import type { ImageRef } from "@/lib/types";

interface UploadingItem {
  id: number;
  name: string;
  previewUrl: string;
}

interface Props {
  images: ImageRef[];
  onChange: (images: ImageRef[]) => void;
  /** single: one image slot (portrait, cover). multi: gallery with ordering. */
  multiple?: boolean;
  label?: string;
  hint?: string;
}

let uploadCounter = 0;

export default function ImageUploader({
  images,
  onChange,
  multiple = true,
  label,
  hint,
}: Props) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  // Keep latest images in a ref so parallel uploads append correctly.
  const imagesRef = useRef(images);
  imagesRef.current = images;

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const accepted = files.filter((f) => f.type.startsWith("image/"));
      if (accepted.length === 0) {
        toast("فقط می‌توانید عکس بارگذاری کنید.", "error");
        return;
      }
      const batch = multiple ? accepted : accepted.slice(0, 1);

      for (const file of batch) {
        const id = ++uploadCounter;
        const previewUrl = URL.createObjectURL(file);
        setUploading((prev) => [...prev, { id, name: file.name, previewUrl }]);

        try {
          const compressed = await compressImage(file);
          const form = new FormData();
          form.append(
            "file",
            new File([compressed], file.name.replace(/\.[^.]+$/, ".webp"), {
              type: compressed.type || "image/webp",
            }),
          );
          const image = await apiFetch<ImageRef>("/api/admin/upload", {
            method: "POST",
            body: form,
          });
          if (multiple) {
            onChange([...imagesRef.current, image]);
          } else {
            onChange([image]);
          }
        } catch (error) {
          toast(
            error instanceof Error ? error.message : "عکس بارگذاری نشد؛ دوباره امتحان کنید.",
            "error",
          );
        } finally {
          URL.revokeObjectURL(previewUrl);
          setUploading((prev) => prev.filter((u) => u.id !== id));
        }
      }
    },
    [multiple, onChange, toast],
  );

  function move(index: number, direction: -1 | 1) {
    const next = [...images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function remove(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  // Single-image slot that already has a photo: compact row instead of a
  // full dropzone above a floating thumbnail.
  const filledSingle = !multiple && images.length > 0;

  return (
    <div>
      {label && (
        <p className="mb-1.5 flex items-baseline gap-2 text-[0.88rem] font-semibold">
          {label}
          {hint && <span className="text-[0.75rem] font-normal text-muted">{hint}</span>}
        </p>
      )}

      {filledSingle ? (
        <div className="flex items-center gap-4 rounded-xl border border-line bg-paper p-3">
          <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-cream">
            <Image
              src={images[0].src}
              alt={images[0].alt ?? ""}
              fill
              sizes="128px"
              className="object-cover"
            />
            {uploading.length > 0 && (
              <span className="absolute inset-0 grid place-items-center bg-white/50">
                <Spinner className="text-espresso" />
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 rounded-lg border border-line-strong px-3.5 py-2 text-[0.85rem] font-semibold transition-colors hover:border-copper/60 hover:text-copper"
            >
              <UploadIcon size={15} />
              تعویض عکس
            </button>
            <button
              type="button"
              onClick={() => remove(0)}
              className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-[0.85rem] font-semibold text-muted transition-colors hover:text-[#a03325]"
            >
              <TrashIcon size={15} />
              حذف عکس
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            uploadFiles(Array.from(e.dataTransfer.files));
          }}
          className={`grid w-full place-items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
            dragOver
              ? "border-copper bg-copper/5 text-copper"
              : "border-line-strong bg-paper text-muted hover:border-copper/60 hover:text-copper"
          }`}
        >
          <UploadIcon size={26} />
          <span className="text-[0.92rem] font-semibold text-ink">
            {multiple ? "عکس‌ها را انتخاب کنید یا همین‌جا رها کنید" : "عکس را انتخاب کنید"}
          </span>
          <span className="text-[0.78rem]">
            کیفیت و حجم عکس به‌صورت خودکار برای سایت بهینه می‌شود
          </span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={(e) => {
          if (e.target.files) uploadFiles(Array.from(e.target.files));
          e.target.value = "";
        }}
      />

      {!filledSingle && (images.length > 0 || uploading.length > 0) && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, i) => (
            <li
              key={`${image.src}-${i}`}
              className="group relative overflow-hidden rounded-lg border border-line bg-cream"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={image.src}
                  alt={image.alt ?? ""}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
              </div>
              {multiple && i === 0 && (
                <span className="absolute top-2 start-2 rounded-md bg-espresso/85 px-2 py-0.5 text-[0.68rem] font-semibold text-bone">
                  عکس اصلی
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                {multiple && images.length > 1 ? (
                  <span className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      className="grid size-7 place-items-center rounded-md bg-white/90 text-ink disabled:opacity-40"
                      aria-label="جابه‌جایی به جلو"
                      title="جلوتر"
                    >
                      <ChevronUpIcon size={14} className="rotate-90" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === images.length - 1}
                      className="grid size-7 place-items-center rounded-md bg-white/90 text-ink disabled:opacity-40"
                      aria-label="جابه‌جایی به عقب"
                      title="عقب‌تر"
                    >
                      <ChevronDownIcon size={14} className="rotate-90" />
                    </button>
                  </span>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="grid size-7 place-items-center rounded-md bg-white/90 text-[#a03325]"
                  aria-label="حذف عکس"
                  title="حذف"
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            </li>
          ))}
          {uploading.map((item) => (
            <li
              key={item.id}
              className="relative overflow-hidden rounded-lg border border-line"
            >
              <div className="relative aspect-[4/3] opacity-50">
                {/* Local object URL preview while uploading */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.previewUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute inset-0 grid place-items-center bg-white/40">
                <span className="flex items-center gap-2 rounded-full bg-espresso px-3 py-1.5 text-[0.75rem] font-semibold text-bone">
                  <Spinner className="size-3" />
                  در حال بارگذاری…
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
