import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { ToastProvider } from "@/components/admin/Toast";
import { isAuthenticated, isUsingDefaultPassword } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { storageMode } from "@/lib/storage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "پنل مدیریت",
  robots: { index: false },
};

export default async function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const content = await getContent();

  return (
    <ToastProvider>
      <AdminShell
        storageMode={storageMode()}
        usingDefaultPassword={isUsingDefaultPassword()}
        businessName={content.settings.businessName}
      >
        {children}
      </AdminShell>
    </ToastProvider>
  );
}
