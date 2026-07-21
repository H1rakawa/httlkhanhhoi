import DashboardIcon from "@/com/dashboard/DashboardIcon";

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
        "flex h-10 shrink-0 items-center gap-2 rounded-full px-3 text-xs font-extrabold transition-colors sm:h-11 sm:px-4 sm:text-sm",
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
  total,
  showingCount,
  showingFrom,
  showingTo,
  onChangeRole,
  onLock,
  onDelete,
}: {
  selectedCount: number;
  total: number;
  showingCount: number;
  showingFrom: number;
  showingTo: number;
  onChangeRole: () => void;
  onLock: () => void;
  onDelete: () => void;
}) {
  const showingRange = showingCount
    ? `Hiển thị ${showingFrom} - ${showingTo}`
    : "Hiển thị 0";
  const showingTotal = `trên ${total} thành viên`;

  return (
    <div className="pointer-events-none sticky bottom-3 z-20 mt-10 flex flex-col gap-3 lg:bottom-4 lg:mt-24 lg:flex-row lg:items-center lg:justify-between">
      <div className="pointer-events-auto inline-flex w-full items-center gap-3 rounded-[22px] border border-white/72 bg-white/78 px-4 py-3 text-sm font-extrabold text-[#3d4650] shadow-[0_18px_42px_rgba(31,48,70,0.14)] backdrop-blur-2xl sm:w-fit sm:rounded-full sm:px-5">
        <DashboardIcon name="community" className="h-5 w-5 stroke-[2.2] sm:h-6 sm:w-6" />
        <span className="leading-5">
          {showingRange}
          <span className="block">{showingTotal}</span>
        </span>
      </div>

      {selectedCount > 0 && (
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
            <BulkAction label="Đổi vai trò" onClick={onChangeRole}>
              <DashboardIcon name="community" className="h-4 w-4" />
            </BulkAction>
            <BulkAction label="Khóa tài khoản" onClick={onLock}>
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
                <circle cx="12" cy="12" r="8" />
                <path d="m8 8 8 8" />
              </svg>
            </BulkAction>
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
      )}
    </div>
  );
}
