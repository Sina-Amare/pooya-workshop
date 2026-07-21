import Image from "next/image";
import type { ImageRef } from "@/lib/types";

interface Props {
  image: ImageRef;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  className?: string;
  quality?: number;
  alt?: string;
}

/** next/image wrapper bound to our ImageRef shape (blur placeholder included). */
export default function SmartImage({
  image,
  sizes,
  priority,
  fill,
  className,
  quality,
  alt,
}: Props) {
  const common = {
    src: image.src,
    alt: alt ?? image.alt ?? "",
    sizes,
    priority,
    quality,
    className,
    ...(image.blurDataURL
      ? { placeholder: "blur" as const, blurDataURL: image.blurDataURL }
      : {}),
  };
  if (fill) {
    return <Image {...common} fill />;
  }
  return <Image {...common} width={image.width} height={image.height} />;
}
