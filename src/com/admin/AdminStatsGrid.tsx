import DashboardIcon from "@/com/dashboard/DashboardIcon";
import { adminStats } from "@/com/admin/adminData";

const toneClassName: Record<string, string> = {
  success: "text-[#2f8c52]",
  danger: "text-[#d33b34]",
  neutral: "text-[#6b7280]",
};

export default function AdminStatsGrid() {
  return (
    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {adminStats.map((stat) => (
        <article
          key={stat.title}
          className="group min-h-[150px] rounded-[24px] border border-white/72 bg-white/36 p-6 shadow-[0_22px_54px_rgba(31,48,70,0.12)] backdrop-blur-2xl transition-transform duration-300 hover:-translate-y-1"
        >
          <div className="flex items-start justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-[#101418]/8 text-[#36434d] shadow-inner">
              <DashboardIcon name={stat.icon} className="h-5 w-5" />
            </span>
            <span
              className={[
                "text-sm font-extrabold",
                toneClassName[stat.tone] || toneClassName.neutral,
              ].join(" ")}
            >
              {stat.delta}
            </span>
          </div>
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#6c747d]">
            {stat.title}
          </p>
          <p className="mt-3 text-xl font-extrabold text-[#111827]">{stat.value}</p>
        </article>
      ))}
    </section>
  );
}
