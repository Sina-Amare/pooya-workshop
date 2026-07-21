import SettingsForm from "@/components/admin/SettingsForm";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const content = await getContent();
  return (
    <div className="space-y-5">
      <div className="mx-auto max-w-2xl">
        <h1 className="heading-section text-2xl">مشخصات و راه‌های تماس</h1>
        <p className="mt-1 text-[0.88rem] text-muted">
          عکس شما، شماره تماس و متن‌های سایت از اینجا عوض می‌شود.
        </p>
      </div>
      <SettingsForm settings={content.settings} />
    </div>
  );
}
