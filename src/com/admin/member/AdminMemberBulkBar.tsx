import DashboardIcon from "@/com/dashboard/DashboardIcon";
import { BulkRoleButton } from "@/com/admin/member/AdminMemberMenus";
import type { MemberRole } from "@/lib/roles";

const bulkActionClassName =
  "flex h-10 shrink-0 items-center gap-2 rounded-full px-3 text-xs font-extrabold transition-colors sm:h-11 sm:px-4 sm:text-sm";

function BulkAction({
  label,
  danger = false,
  onClick,
  children,
}: {
  label: string;
  danger?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        bulkActionClassName,
        danger
          ? "text-[#ef4444] hover:bg-[#fff1f0]"
          : "text-[#3a424b] hover:bg-white/58",
      ].join(" ")}
    >
      {children}
      {label}
    </button>
  );
}

export default function AdminMemberBulkBar({
  selectedCount,
  includesSelf,
  onPickRole,
  onDelete,
}: {
  selectedCount: number;
  includesSelf: boolean;
  onPickRole: (role: MemberRole) => void;
  onDelete: () => void;
}) {
  if (selectedCount <= 0) return null;

  return (
    <div className="pointer-events-none sticky bottom-3 z-20 mt-10 flex justify-end lg:bottom-4 lg:mt-24">
      <div className="pointer-events-auto flex max-w-full flex-col gap-3 rounded-[24px] border border-white/72 bg-white/80 px-3 py-3 shadow-[0_18px_42px_rgba(31,48,70,0.16)] backdrop-blur-2xl sm:px-4 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3 px-1 lg:pr-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0066cc] text-sm font-extrabold text-white">
            {selectedCount}
          </span>
          <span className="text-sm font-extrabold leading-5 text-[#3d4650]">
            Thành viên
            <span className="block">đang chọn</span>
          </span>
        </div>
        <div className="flex max-w-full items-center gap-2 overflow-x-auto pb-1">
          <BulkRoleButton
            includesSelf={includesSelf}
            onPick={onPickRole}
            className={`${bulkActionClassName} text-[#3a424b] hover:bg-white/58`}
          >
            <DashboardIcon name="community" className="h-4 w-4" />
            Đổi vai trò
          </BulkRoleButton>
          <BulkAction label="Xóa vĩnh viễn" danger onClick={onDelete}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M4 7h16" />
              <path d="M10 11v6M14 11v6" />
              <path d="M6 7l1 14h10l1-14" />
            </svg>
          </BulkAction>
        </div>
      </div>
    </div>
  );
}
