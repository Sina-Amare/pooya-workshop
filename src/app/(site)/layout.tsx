import FloatingContact from "@/components/site/FloatingContact";
import Footer from "@/components/site/Footer";
import Header from "@/components/site/Header";
import { getContent } from "@/lib/content";
import { phoneHref, whatsappHref } from "@/lib/fa";

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const content = await getContent();
  const { settings } = content;
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[100] focus:rounded-lg focus:bg-espresso focus:px-4 focus:py-2.5 focus:font-semibold focus:text-bone"
      >
        پرش به محتوای اصلی
      </a>
      <Header
        businessName={settings.businessName}
        tagline={settings.tagline}
        phone={settings.phone}
      />
      <main id="main" className="min-h-[60vh]">{children}</main>
      <Footer settings={settings} categories={content.categories} />
      <FloatingContact
        whatsapp={settings.whatsapp}
        phoneHref={phoneHref(settings.phone)}
        whatsappHref={settings.whatsapp ? whatsappHref(settings.whatsapp) : undefined}
      />
    </>
  );
}
