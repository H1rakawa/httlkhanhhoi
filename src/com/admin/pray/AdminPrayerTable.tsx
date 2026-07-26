import Pagination from "@/com/lib/Pagination";
import type {
  AdminPrayerCategory,
  AdminPrayerItem,
  AdminPrayerStatus,
} from "./adminPrayerData";

const categoryClassName: Record<AdminPrayerCategory, string> = {
  "Sức khỏe": "bg-[#fff0bc] text-[#9a6d17]",
  "Gia đình": "bg-[#dfe8ff] text-[#48669f]",
  "Tâm linh": "bg-[#e2ebff] text-[#48669f]",
  "Tài chính": "bg-[#f3ebd8] text-[#7a684c]",
};

const statusLabel: Record<AdminPrayerStatus, string> = {
  pending: "Chờ duyệt",
  approved: "Công khai",
  answered: "Đã nhận lời",
};

const statusClassName: Record<AdminPrayerStatus, string> = {
  pending: "bg-[#fff2c9] text-[#8a6110]",
  approved: "bg-[#e8f8ee] text-[#2d8f58]",
  answered: "bg-white/82 text-[#667085]",
};

type AdminPrayerTableProps = {
  items: AdminPrayerItem[];
  selectedIds: string[];
  page: number;
  pageSize: number;
  total: number;
  onTogglePrayer: (prayerId: string) => void;
  onToggleAll: () => void;
  onPageChange: (page: number) => void;
};

function SelectCheckbox({
  checked,
  mixed = false,
  label,
  onClick,
}: {
  checked: boolean;
  mixed?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex h-5 w-5 items-center justify-center rounded-md border transition",
        checked || mixed
          ? "border-[#0066cc] bg-[#0066cc] text-white shadow-[0_8px_18px_rgba(0,102,204,0.22)]"
          : "border-white/80 bg-white/86 text-transparent shadow-inner hover:border-[#0066cc]/50 hover:text-[#0066cc]/55",
      ].join(" ")}
      aria-label={label}
      aria-pressed={checked}
    >
      {mixed ? (
        <span className="h-0.5 w-2.5 rounded-full bg-current" />
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="m5 12 4 4L19 6" />
        </svg>
      )}
    </button>
  );
}

function AdminPrayerActionButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#667085] transition hover:bg-white/64 hover:text-[#182230]"
      aria-label={`Mở thao tác cho ${label}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <circle cx="12" cy="5" r="1.8" />
        <circle cx="12" cy="12" r="1.8" />
        <circle cx="12" cy="19" r="1.8" />
      </svg>
    </button>
  );
}

export default function AdminPrayerTable({
  items,
  selectedIds,
  page,
  pageSize,
  total,
  onTogglePrayer,
  onToggleAll,
  onPageChange,
}: AdminPrayerTableProps) {
  const isAllSelected = items.length > 0 && selectedIds.length === items.length;
  const hasSelection = selectedIds.length > 0;

  return (
    <section className="liquid-glass mt-6 overflow-hidden rounded-[28px]">
      <div className="hidden lg:block">
        <table className="w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="border-b border-white/40 bg-white/28 text-xs font-extrabold uppercase tracking-[0.08em] text-[#738095]">
              <th className="w-14 px-6 py-5">
                <SelectCheckbox
                  checked={isAllSelected}
                  mixed={hasSelection && !isAllSelected}
                  label={
                    isAllSelected
                      ? "Bỏ chọn tất cả lời cầu thay"
                      : "Chọn tất cả lời cầu thay"
                  }
                  onClick={onToggleAll}
                />
              </th>
              <th className="px-4 py-5">Lời cầu thay</th>
              <th className="w-[152px] px-4 py-5">Ngày gửi</th>
              <th className="w-[144px] px-4 py-5">Trạng thái</th>
              <th className="w-[110px] px-4 py-5 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isSelected = selectedIds.includes(item.id);

              return (
                <tr
                  key={item.id}
                  className={[
                    "border-b border-white/36 text-sm font-extrabold text-[#344054] transition-colors last:border-b-0",
                    isSelected
                      ? "bg-[#eaf4ff]/52 hover:bg-[#e0f0ff]/70"
                      : "bg-white/16 hover:bg-white/42",
                  ].join(" ")}
                >
                  <td className="px-6 py-5">
                    <SelectCheckbox
                      checked={isSelected}
                      label={
                        isSelected
                          ? `Bỏ chọn ${item.title}`
                          : `Chọn ${item.title}`
                      }
                      onClick={() => onTogglePrayer(item.id)}
                    />
                  </td>
                  <td className="px-4 py-5">
                    <div className="min-w-0">
                      <p className="truncate text-base font-extrabold text-[#182230]">
                        {item.title}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs font-bold text-[#667085]">
                        {item.content}
                      </p>
                      <div className="mt-2 flex min-w-0 items-center gap-2">
                        <span className="truncate text-xs font-extrabold text-[#526579]">
                          {item.senderName}
                        </span>
                        <span
                          className={[
                            "inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold",
                            categoryClassName[item.category],
                          ].join(" ")}
                        >
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-[#526579]">
                    {item.submittedDate}
                  </td>
                  <td className="px-4 py-5">
                    <span
                      className={[
                        "inline-flex rounded-full px-3 py-1.5 text-xs font-extrabold",
                        statusClassName[item.status],
                      ].join(" ")}
                    >
                      {statusLabel[item.status]}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <AdminPrayerActionButton label={item.title} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-3 lg:hidden">
        {items.map((item) => {
          const isSelected = selectedIds.includes(item.id);

          return (
            <article
              key={item.id}
              className={[
                "rounded-[22px] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_16px_34px_rgba(31,48,70,0.08)] transition-colors",
                isSelected
                  ? "border-[#0066cc]/30 bg-[#eaf4ff]/58"
                  : "border-white/60 bg-white/34 hover:bg-white/50",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <SelectCheckbox
                  checked={isSelected}
                  label={
                    isSelected ? `Bỏ chọn ${item.title}` : `Chọn ${item.title}`
                  }
                  onClick={() => onTogglePrayer(item.id)}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-extrabold text-[#182230]">
                    {item.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-[#667085]">
                    {item.content}
                  </p>
                </div>
                <AdminPrayerActionButton label={item.title} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-extrabold text-[#526579] sm:grid-cols-3">
                <span className="rounded-2xl bg-white/58 px-3 py-2">
                  Người gửi
                  <span className="mt-1 block truncate text-[#182230]">
                    {item.senderName}
                  </span>
                </span>
                <span className="rounded-2xl bg-white/58 px-3 py-2">
                  Ngày gửi
                  <span className="mt-1 block text-[#182230]">
                    {item.submittedDate}
                  </span>
                </span>
                <span className="rounded-2xl bg-white/58 px-3 py-2">
                  Trạng thái
                  <span
                    className={[
                      "mt-1 block w-fit rounded-full px-2.5 py-1",
                      statusClassName[item.status],
                    ].join(" ")}
                  >
                    {statusLabel[item.status]}
                  </span>
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 border-t border-white/36 bg-white/20 px-5 py-4 text-sm font-extrabold text-[#526579] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span>
            {total > 0
              ? `Hiển thị ${items.length}/${total} lời cầu thay`
              : "Hiển thị 0 lời cầu thay"}
          </span>
          {hasSelection && (
            <span className="text-[#0066cc]">
              {selectedIds.length} lời cầu thay đang chọn
            </span>
          )}
        </div>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          className="justify-start gap-2 p-0 sm:justify-center"
          onPageChange={onPageChange}
        />
      </div>
    </section>
  );
}
