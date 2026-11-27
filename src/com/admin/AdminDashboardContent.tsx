import AdminActivityPanel from "@/com/admin/AdminActivityPanel";
import AdminQuickActions from "@/com/admin/AdminQuickActions";
import AdminSidebar from "@/com/admin/AdminSidebar";
import AdminStatsGrid from "@/com/admin/AdminStatsGrid";
import AdminSystemPanel from "@/com/admin/AdminSystemPanel";
import type { AdminOverview } from "@/lib/admin/overview";

type AdminDashboardContentProps = {
  adminId: string;
  displayName: string;
  avatarUrl: string | null;
  viewerRole?: string | null;
  overview: AdminOverview;
};

export default function AdminDashboardContent({
  adminId,
  displayName,
  avatarUrl,
  viewerRole,
  overview,
}: AdminDashboardContentProps) {
  const pendingPrayers =
    overview.todos.find((todo) => todo.key === "prayers")?.count ?? null;

  return (
    <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-375 grid-cols-[auto_minmax(0,1fr)] gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4 md:gap-5 md:px-5 md:py-5 lg:grid-cols-[244px_minmax(0,1fr)] lg:gap-6 lg:px-6 lg:py-6 xl:grid-cols-[268px_minmax(0,1fr)]">
      <AdminSidebar
        adminId={adminId}
        displayName={displayName}
        avatarUrl={avatarUrl}
        role={viewerRole}
        activeHref="/admin"
      />
      <section className="min-w-0">
        <div className="min-h-[calc(100svh-2rem)] rounded-[30px] border border-white/72 bg-[rgba(222,235,235,0.38)] p-5 shadow-[0_34px_120px_rgba(15,23,42,0.16)] backdrop-blur-sm md:min-h-[calc(100svh-3rem)] md:p-8 xl:p-9">
          <div className="grid gap-7 pb-4 lg:gap-8">
            <AdminStatsGrid values={overview.stats} canManageMembers={viewerRole === "admin"} />
            <AdminQuickActions
              pendingPrayers={pendingPrayers}
              canManageMembers={viewerRole === "admin"}
            />
            <div className="grid gap-7 xl:grid-cols-[minmax(0,1.48fr)_minmax(280px,0.72fr)]">
              <AdminActivityPanel activities={overview.activities} />
              <AdminSystemPanel todos={overview.todos} progress={overview.progress} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
