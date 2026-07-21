import { redirect } from "next/navigation";
import AdminExamContent from "@/com/admin/exam/AdminExamContent";
import SiteParallaxBackdrop from "@/com/shared/SiteParallaxBackdrop";
import { getCurrentAccount } from "@/lib/supabase/auth";
import {
  getUserAvatarUrl,
  getUserDisplayName,
} from "@/lib/supabase/user-display";

export default async function AdminExamPage() {
  const account = await getCurrentAccount();

  if (!account) redirect("/auth");
  if (account.profile?.role !== "admin") redirect("/dashboard");

  return (
    <main className="relative min-h-screen overflow-clip bg-[#edf4ea] text-[#111827]">
      <SiteParallaxBackdrop
        priority
        imageOpacity="opacity-72"
        overlayClassName="bg-[#dfe8d2]/34 backdrop-blur-[0.5px]"
        strength={0.08}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_76%_14%,rgba(255,255,216,0.62),transparent_24%),radial-gradient(circle_at_18%_82%,rgba(187,221,154,0.32),transparent_28%)]" />
      <AdminExamContent
        adminId={account.user.id}
        displayName={getUserDisplayName(account.user, account.profile)}
        avatarUrl={getUserAvatarUrl(account.user, account.profile)}
      />
    </main>
  );
}
