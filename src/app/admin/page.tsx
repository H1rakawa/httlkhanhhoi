import { redirect } from "next/navigation";
import AdminDashboardContent from "@/com/admin/AdminDashboardContent";
import SiteParallaxBackdrop from "@/com/shared/SiteParallaxBackdrop";
import { getCurrentAccount } from "@/lib/supabase/auth";
import {
  getUserAvatarUrl,
  getUserDisplayName,
} from "@/lib/supabase/user-display";

export default async function AdminDashboardPage() {
  const account = await getCurrentAccount();

  if (!account) redirect("/auth");
  if (account.profile?.role !== "admin") redirect("/dashboard");

  return (
    <main className="relative min-h-screen overflow-clip bg-[#eef3f7] text-[#111827]">
      <SiteParallaxBackdrop
        priority
        imageOpacity="opacity-72"
        overlayClassName="bg-[#dfe8e7]/38 backdrop-blur-[0.5px]"
        strength={0.08}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_78%_16%,rgba(255,255,221,0.55),transparent_25%),radial-gradient(circle_at_18%_78%,rgba(183,202,255,0.34),transparent_24%)]" />
      <AdminDashboardContent
        adminId={account.user.id}
        displayName={getUserDisplayName(account.user, account.profile)}
        avatarUrl={getUserAvatarUrl(account.user, account.profile)}
      />
    </main>
  );
}
