import { redirect } from "next/navigation";
import AdminExamDetailContent from "@/com/admin/exam/AdminExamDetailContent";
import SiteParallaxBackdrop from "@/com/shared/SiteParallaxBackdrop";
import { getCurrentAccount } from "@/lib/supabase/auth";
import {
  getUserAvatarUrl,
  getUserDisplayName,
} from "@/lib/supabase/user-display";

type AdminExamDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminExamDetailPage({
  params,
}: AdminExamDetailPageProps) {
  const account = await getCurrentAccount();

  if (!account) redirect("/auth");
  if (account.profile?.role !== "admin") redirect("/dashboard");

  const { id } = await params;

  return (
    <main className="relative min-h-screen overflow-clip bg-[#f1f4fb] text-[#111827]">
      <SiteParallaxBackdrop
        priority
        imageOpacity="opacity-54"
        overlayClassName="bg-[#eef2fb]/50 backdrop-blur-[0.5px]"
        strength={0.06}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_74%_12%,rgba(255,244,209,0.56),transparent_24%),radial-gradient(circle_at_18%_82%,rgba(214,224,255,0.42),transparent_28%)]" />
      <AdminExamDetailContent
        examId={id}
        adminId={account.user.id}
        displayName={getUserDisplayName(account.user, account.profile)}
        avatarUrl={getUserAvatarUrl(account.user, account.profile)}
      />
    </main>
  );
}
