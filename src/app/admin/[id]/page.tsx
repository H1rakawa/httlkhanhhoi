import { redirect } from "next/navigation";
import AdminProfileContent from "@/com/admin/AdminProfileContent";
import SiteParallaxBackdrop from "@/com/shared/SiteParallaxBackdrop";
import { getCurrentAccount } from "@/lib/supabase/auth";
import {
  getUserAvatarUrl,
  getUserDisplayEmail,
  getUserDisplayName,
} from "@/lib/supabase/user-display";

type AdminProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminProfilePage({
  params,
}: AdminProfilePageProps) {
  const account = await getCurrentAccount();

  if (!account) redirect("/auth");
  if (account.profile?.role !== "admin") redirect("/dashboard");

  const { id } = await params;
  if (id !== account.user.id) redirect(`/admin/${account.user.id}`);

  return (
    <main className="relative min-h-screen overflow-clip bg-[#eef3f7] text-[#111827]">
      <SiteParallaxBackdrop
        priority
        imageOpacity="opacity-72"
        overlayClassName="bg-[#dfe8e7]/38 backdrop-blur-[0.5px]"
        strength={0.08}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_78%_16%,rgba(255,255,221,0.55),transparent_25%),radial-gradient(circle_at_18%_78%,rgba(183,202,255,0.34),transparent_24%)]" />
      <AdminProfileContent
        adminId={account.user.id}
        displayName={getUserDisplayName(account.user, account.profile)}
        email={getUserDisplayEmail(account.user, account.profile)}
        phone={account.profile?.phone}
        avatarUrl={getUserAvatarUrl(account.user, account.profile)}
      />
    </main>
  );
}
