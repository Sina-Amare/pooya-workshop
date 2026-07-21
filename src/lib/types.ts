export interface ImageRef {
  src: string;
  width: number;
  height: number;
  alt?: string;
  blurDataURL?: string;
}

export interface Category {
  id: string;
  title: string;
  slug: string;
  description?: string;
  cover?: ImageRef;
  order: number;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  summary?: string;
  description?: string;
  materials?: string[];
  location?: string;
  year?: string;
  featured: boolean;
  order: number;
  createdAt: string;
  images: ImageRef[];
}

export interface SiteSettings {
  businessName: string;
  ownerName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutIntro: string;
  aboutBody: string;
  /** null = deliberately cleared by the admin (survives JSON round-trip, unlike undefined). */
  portrait?: ImageRef | null;
  heroImage?: ImageRef | null;
  phone: string;
  whatsapp?: string;
  instagram?: string;
  address?: string;
  serviceArea?: string;
  hours?: string;
  experienceYears?: string;
}

export interface SiteContent {
  settings: SiteSettings;
  categories: Category[];
  projects: Project[];
  updatedAt: string;
}

/** Content plus a flag describing where it came from. */
export type ContentSource = "seed" | "local" | "blob";

export interface LoadedContent extends SiteContent {
  source: ContentSource;
}
