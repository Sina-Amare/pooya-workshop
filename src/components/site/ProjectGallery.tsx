"use client";

import { useEffect, useId } from "react";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";
import SmartImage from "@/components/site/SmartImage";
import { faNum } from "@/lib/fa";
import type { ImageRef } from "@/lib/types";

interface Props {
  images: ImageRef[];
  title: string;
}

/**
 * Project photo grid: first photo full width, the rest in a two-column grid.
 * Clicking opens a PhotoSwipe lightbox with pinch-zoom and keyboard nav.
 */
export default function ProjectGallery({ images, title }: Props) {
  const galleryId = useId().replace(/[:]/g, "");

  useEffect(() => {
    const lightbox = new PhotoSwipeLightbox({
      gallery: `#g-${galleryId}`,
      children: "a.gallery-link",
      pswpModule: () => import("photoswipe"),
      showHideAnimationType: "fade",
      bgOpacity: 1,
      closeTitle: "بستن",
      zoomTitle: "بزرگ‌نمایی",
      arrowPrevTitle: "تصویر قبلی",
      arrowNextTitle: "تصویر بعدی",
      errorMsg: "تصویر بارگذاری نشد",
    });
    // Persian digits for the "1 / 2" counter.
    const localizeCounter = () => {
      const counter = lightbox.pswp?.element?.querySelector(".pswp__counter");
      if (counter && lightbox.pswp) {
        counter.textContent = `${faNum(lightbox.pswp.currIndex + 1)} / ${faNum(
          lightbox.pswp.getNumItems(),
        )}`;
      }
    };
    lightbox.on("afterInit", localizeCounter);
    lightbox.on("change", localizeCounter);
    lightbox.init();
    return () => lightbox.destroy();
  }, [galleryId]);

  if (images.length === 0) {
    return (
      <div className="grid aspect-[3/2] place-items-center rounded-xl border border-dashed border-line-strong text-muted">
        هنوز تصویری برای این پروژه ثبت نشده است.
      </div>
    );
  }

  const [first, ...rest] = images;

  // Natural aspect ratio so photos are never cropped; height stays bounded.
  const renderItem = (image: ImageRef, i: number, wide: boolean) => {
    const portrait = image.height > image.width;
    return (
      <a
        key={`${image.src}-${i}`}
        href={image.src}
        data-pswp-width={image.width}
        data-pswp-height={image.height}
        target="_blank"
        rel="noreferrer"
        className={`gallery-link photo-frame group block ${
          wide && portrait ? "mx-auto w-full max-w-2xl" : ""
        }`}
        style={{ aspectRatio: `${image.width} / ${image.height}` }}
        aria-label={`نمایش بزرگ‌تر تصویر ${i + 1} از ${title}`}
      >
        <SmartImage
          image={image}
          alt={image.alt ?? `${title} — تصویر ${i + 1}`}
          fill
          priority={i === 0}
          sizes={wide ? "(max-width: 768px) 100vw, 90vw" : "(max-width: 768px) 100vw, 50vw"}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
        />
      </a>
    );
  };

  return (
    <div id={`g-${galleryId}`} className="grid gap-4 md:gap-5">
      {renderItem(first, 0, true)}
      {rest.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          {rest.map((image, i) => renderItem(image, i + 1, false))}
        </div>
      )}
    </div>
  );
}
