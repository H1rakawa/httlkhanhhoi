import Image from "next/image";
import Link from "next/link";
import DashboardIcon from "@/com/dashboard/DashboardIcon";
import { adminSidebarItems } from "@/com/admin/adminData";

type AdminSidebarProps = {
  adminId: string;
  displayName: string;
  avatarUrl: string | null;
  activeHref?: string;
};

export default function AdminSidebar({
  adminId,
  displayName,
  avatarUrl,
  activeHref,
}: AdminSidebarProps) {
  return (
    <aside className="z-20 flex min-h-0 flex-col overflow-hidden rounded-[24px] border border-white/70 bg-[rgba(232,241,242,0.58)] p-3 shadow-[0_30px_90px_rgba(31,48,70,0.16)] backdrop-blur-2xl md:p-5 lg:sticky lg:top-6 lg:h-[calc(100svh-3rem)] lg:rounded-[30px] lg:bg-[rgba(231,241,240,0.5)] lg:p-6">
      <div className="min-h-0 shrink-0">
        <Link
          href="/"
          className="mb-6 flex h-12 items-center justify-center no-underline md:mb-7 md:justify-start md:px-2"
          aria-label="HTTL. Khánh Hội trang chủ"
        >
          <Image
            src="/logo.png"
            alt="Hội Thánh Tin Lành Khánh Hội"
            width={224}
            height={72}
            priority
            className="hidden h-auto w-[176px] object-contain md:block"
          />
          <Image
            src="/favicon.png"
            alt=""
            width={36}
            height={36}
            priority
            className="h-9 w-9 object-contain md:hidden"
          />
        </Link>
        <nav className="grid gap-2 overflow-y-auto pr-0.5">
          {adminSidebarItems.map((item) => {
            const isActive = activeHref === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex h-12 items-center justify-center rounded-[10px] text-sm font-extrabold no-underline transition-all duration-300 md:justify-start md:gap-3 md:px-4",
                  isActive
                    ? "border border-[#0f172a]/20 bg-white/72 text-[#111827] shadow-[0_12px_26px_rgba(31,48,70,0.12)]"
                    : "text-[#2f3a44] hover:bg-white/62 hover:text-[#111827]",
                ].join(" ")}
                title={item.label}
              >
                <DashboardIcon name={item.icon} className="h-5 w-5 stroke-[2.2]" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-5 border-t border-[#4b6174]/12 pt-3 md:pt-5 lg:mt-auto lg:pt-6">
        <Link
          href={`/admin/${adminId}`}
          className="flex items-center justify-center rounded-2xl p-1.5 text-[#101418] no-underline transition-all duration-300 hover:bg-white/56 md:justify-start md:gap-3 md:p-2"
          title={displayName || "Admin Grace"}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-[#121715] text-sm font-bold text-white shadow-[0_10px_24px_rgba(31,48,70,0.18)] lg:h-11 lg:w-11">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt=""
                width={44}
                height={44}
                className="h-full w-full object-cover"
              />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </span>
          <div className="hidden min-w-0 md:block">
            <p className="truncate text-sm font-bold text-[#101418]">
              {displayName || "Admin Grace"}
            </p>
            <p className="text-xs font-medium text-[#687580]">Quản trị viên</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
