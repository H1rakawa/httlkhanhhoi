import DashboardIcon from "@/com/dashboard/DashboardIcon";
import { adminQuickActions } from "@/com/admin/adminData";

export default function AdminQuickActions() {
  return (
    <section className="flex flex-col gap-4 md:flex-row md:items-center">
      <p className="text-sm font-semibold text-[#252b31]">Thao tác nhanh</p>
      <div className="flex flex-wrap gap-3 md:gap-4">
        {adminQuickActions.map((action) => (
          <button
            key={action.label}
            className={[
              "flex h-11 items-center gap-2 rounded-full px-6 text-sm font-extrabold shadow-[0_14px_30px_rgba(31,48,70,0.12)] transition-all duration-300 hover:-translate-y-0.5",
              action.primary
                ? "bg-[#111614] text-white"
                : "border border-white/76 bg-white/76 text-[#3d454d] backdrop-blur-xl",
            ].join(" ")}
            type="button"
          >
            <DashboardIcon name={action.icon} className="h-5 w-5" />
            {action.label}
          </button>
        ))}
      </div>
    </section>
  );
}
