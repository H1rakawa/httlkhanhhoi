import { redirect } from "next/navigation";
import AdminExamBuilderContent from "@/com/admin/exam/AdminExamBuilderContent";
import SiteParallaxBackdrop from "@/com/shared/SiteParallaxBackdrop";
import { getCurrentAccount } from "@/lib/supabase/auth";
import {
  getUserAvatarUrl,
  getUserDisplayName,
} from "@/lib/supabase/user-display";

export default async function AdminNewExamPage() {
  const account = await getCurrentAccount();

  if (!account) redirect("/auth");
  if (account.profile?.role !== "admin") redirect("/dashboard");

  return (
    <main className="relative min-h-screen overflow-clip bg-[#eef4ff] text-[#111827]">
      <SiteParallaxBackdrop
        priority
        imageOpacity="opacity-64"
        overlayClassName="bg-[#eef4ff]/40 backdrop-blur-[0.5px]"
        strength={0.08}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_74%_10%,rgba(255,247,214,0.58),transparent_25%),radial-gradient(circle_at_18%_82%,rgba(217,226,255,0.34),transparent_28%)]" />
      <AdminExamBuilderContent
        adminId={account.user.id}
        displayName={getUserDisplayName(account.user, account.profile)}
        avatarUrl={getUserAvatarUrl(account.user, account.profile)}
      />
    </main>
  );
}
