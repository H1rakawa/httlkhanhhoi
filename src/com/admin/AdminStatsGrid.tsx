import Link from "next/link";
import DashboardIcon from "@/com/dashboard/DashboardIcon";
import { adminStats } from "@/com/admin/adminData";
import type { AdminStatValues } from "@/lib/admin/overview";

const toneClassName: Record<string, string> = {
  success: "text-[#2f8c52]",
  danger: "text-[#d33b34]",
  neutral: "text-[#6b7280]",
};

const statLinks: Partial<Record<keyof AdminStatValues, string>> = {
  totalMembers: "/admin/member",
  assignments: "/admin/assignment",
  libraryResources: "/admin/library",
  upcomingEvents: "/admin/events",
};

const format = (value: number) => new Intl.NumberFormat("vi-VN").format(value);

export default function AdminStatsGrid({ values }: { values: AdminStatValues }) {
  return (
    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {adminStats.map((stat) => {
        const value = values[stat.key];
        const failed = value === null;

        return (
          <Link
            key={stat.title}
            href={statLinks[stat.key] ?? "/admin"}
            className="group min-h-[150px] rounded-[24px] border border-white/72 bg-white/36 p-6 text-inherit no-underline shadow-[0_22px_54px_rgba(31,48,70,0.12)] backdrop-blur-2xl transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-[#101418]/8 text-[#36434d] shadow-inner">
                <DashboardIcon name={stat.icon} className="h-5 w-5" />
              </span>
              <span
                className={[
                  "text-sm font-extrabold",
                  failed ? toneClassName.danger : toneClassName[stat.tone] || toneClassName.neutral,
                ].join(" ")}
              >
                {failed ? "Không tải được" : stat.delta}
              </span>
            </div>
            <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#6c747d]">
              {stat.title}
            </p>
            <p className="mt-3 text-xl font-extrabold text-[#111827]">
              {failed ? stat.fallbackValue : format(value)}
            </p>
          </Link>
        );
      })}
    </section>
  );
}
