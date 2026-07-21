"use client";

import Link from "next/link";
import AdminAddMemberButton from "@/com/admin/AdminAddMemberButton";
import { adminQuickActions } from "@/com/admin/adminData";
import DashboardIcon from "@/com/dashboard/DashboardIcon";

export default function AdminQuickActions() {
  return (
    <section className="flex flex-col gap-4 md:flex-row md:items-center">
      <p className="text-sm font-bold text-[#252b31]">Thao tác nhanh</p>
      <div className="flex flex-wrap gap-3 md:gap-4">
        <AdminAddMemberButton
          label="Thêm Thành Viên"
          className="flex h-11 items-center gap-2 rounded-full bg-[#0066cc] px-6 text-sm font-extrabold text-white shadow-[0_18px_34px_rgba(0,102,204,0.26)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0077ee]"
        />
        {adminQuickActions
          .filter((action) => !action.primary)
          .map((action) => {
            const className =
              "flex h-11 items-center gap-2 rounded-full border border-white/76 bg-white/76 px-6 text-sm font-extrabold text-[#3d454d] no-underline shadow-[0_14px_30px_rgba(31,48,70,0.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5";
            const content = (
              <>
                <DashboardIcon name={action.icon} className="h-5 w-5" />
                {action.label}
              </>
            );

            if ("href" in action && action.href) {
              return (
                <Link key={action.label} href={action.href} className={className}>
                  {content}
                </Link>
              );
            }

            return (
              <button key={action.label} className={className} type="button">
                {content}
              </button>
            );
          })}
      </div>
    </section>
  );
}
