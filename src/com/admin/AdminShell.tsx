import AdminSidebar from "@/com/admin/AdminSidebar";
import SiteParallaxBackdrop from "@/com/shared/SiteParallaxBackdrop";
import type { getCurrentAccount } from "@/lib/supabase/auth";
import { getUserAvatarUrl, getUserDisplayName } from "@/lib/supabase/user-display";

type Account = NonNullable<Awaited<ReturnType<typeof getCurrentAccount>>>;

/** Khung chung cho các trang quản trị: nền, sidebar và tấm kính chứa nội dung. */
export default function AdminShell({
  account,
  activeHref,
  children,
}: {
  account: Account;
  activeHref: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-clip bg-[#eef3f7] text-[#111827]">
      <SiteParallaxBackdrop
        priority
        imageOpacity="opacity-72"
        overlayClassName="bg-[#dfe8e7]/38 backdrop-blur-[0.5px]"
        strength={0.08}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_78%_16%,rgba(255,255,221,0.55),transparent_25%),radial-gradient(circle_at_18%_78%,rgba(183,202,255,0.34),transparent_24%)]" />
      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1500px] grid-cols-[auto_minmax(0,1fr)] gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4 md:gap-5 md:px-5 md:py-5 lg:grid-cols-[244px_minmax(0,1fr)] lg:gap-6 lg:px-6 lg:py-6 xl:grid-cols-[268px_minmax(0,1fr)]">
        <AdminSidebar
          adminId={account.user.id}
          displayName={getUserDisplayName(account.user, account.profile)}
          avatarUrl={getUserAvatarUrl(account.user, account.profile)}
          role={account.profile?.role}
          activeHref={activeHref}
        />
        <section className="min-w-0">
          <div className="relative min-h-[calc(100svh-1.5rem)] overflow-hidden rounded-[24px] border border-white/72 bg-[rgba(244,248,255,0.46)] shadow-[0_34px_120px_rgba(15,23,42,0.14)] backdrop-blur-[10px] sm:rounded-[28px] md:min-h-[calc(100svh-2.5rem)] lg:min-h-[calc(100svh-3rem)] lg:rounded-[30px]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(220,230,255,0.56),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(255,247,219,0.52),transparent_24%)]" />
            <div className="relative z-10 min-h-[calc(100svh-1.5rem)] px-5 py-6 text-[#111827] sm:px-8 md:min-h-[calc(100svh-2.5rem)] lg:min-h-[calc(100svh-3rem)] lg:px-9 lg:py-9">
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
