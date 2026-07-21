import type { Metadata, Viewport } from "next";
import { getContent } from "@/lib/content";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getContent();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${settings.businessName} — ${settings.tagline}`,
      template: `%s — ${settings.businessName}`,
    },
    description: settings.heroSubtitle,
    openGraph: {
      type: "website",
      locale: "fa_IR",
      siteName: settings.businessName,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#f8f4ed",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <link
          rel="preload"
          href="/fonts/vazirmatn-arabic-wght-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/estedad-arabic-wght-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {children}
      </body>
    </html>
  );
}
