import Pagination from "@/com/lib/Pagination";
import PrayerAvatar from "@/com/pray/PrayerAvatar";
import {
  ADMIN_PRAYER_STATUS_LABELS,
  formatAdminDate,
  type AdminPrayerItem,
  type AdminPrayerStatus,
} from "./adminPrayerData";

const categoryClassName: Record<string, string> = {
  "Sức khỏe": "bg-[#fff0bc] text-[#9a6d17]",
  "Gia đình": "bg-[#dfe8ff] text-[#48669f]",
  "Tâm linh": "bg-[#e2ebff] text-[#48669f]",
  "Tài chính": "bg-[#f3ebd8] text-[#7a684c]",
  Khác: "bg-[#eef0f4] text-[#5b6472]",
};

export const adminPrayerStatusClassName: Record<AdminPrayerStatus, string> = {
  pending: "bg-[#fff2c9] text-[#8a6110]",
  approved: "bg-[#e8f8ee] text-[#2d8f58]",
  answered: "bg-[#e6f0ff] text-[#0066cc]",
  rejected: "bg-[#fff1f0] text-[#b42318]",
};

type AdminPrayerTableProps = {
  items: AdminPrayerItem[];
  total: number;
  selectedIds: number[];
  busyIds: number[];
  page: number;
  pageSize: number;
  onTogglePrayer: (prayerId: number) => void;
  onToggleAll: () => void;
  onPageChange: (page: number) => void;
  onOpen: (prayer: AdminPrayerItem) => void;
  onSetStatus: (ids: number[], status: AdminPrayerStatus) => void;
  onDelete: (ids: number[]) => void;
  onClearSelection: () => void;
};

function StatusBadge({ status }: { status: AdminPrayerStatus }) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-3 py-1.5 text-xs font-extrabold",
        adminPrayerStatusClassName[status],
      ].join(" ")}
    >
      {ADMIN_PRAYER_STATUS_LABELS[status]}
    </span>
  );
}

function SenderLine({ item }: { item: AdminPrayerItem }) {
  return (
    <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
      <PrayerAvatar name={item.senderName} src={item.senderAvatar} size={22} />
      <span className="truncate text-xs font-extrabold text-[#526579]">{item.senderName}</span>
      {item.isAnonymous && (
        <span className="rounded-full bg-[#eef0f4] px-2 py-0.5 text-[11px] font-extrabold text-[#5b6472]">
          Ẩn danh
        </span>
      )}
      {item.privacy === "private" && (
        <span className="rounded-full bg-[#f3e8ff] px-2 py-0.5 text-[11px] font-extrabold text-[#7c3aed]">
          Riêng tư
        </span>
      )}
      <span
        className={[
          "inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold",
          categoryClassName[item.category] ?? categoryClassName["Khác"],
        ].join(" ")}
      >
        {item.category}
      </span>
    </div>
  );
}

function RowActions({
  item,
  busy,
  onOpen,
  onSetStatus,
}: {
  item: AdminPrayerItem;
  busy: boolean;
  onOpen: () => void;
  onSetStatus: (status: AdminPrayerStatus) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      {item.status === "pending" && (
        <>
          <button
            type="button"
            disabled={busy}
            onClick={() => onSetStatus("approved")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f8ee] text-[#2d8f58] transition hover:bg-[#d3f1de] disabled:opacity-50"
            aria-label={`Duyệt ${item.title}`}
            title="Duyệt"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <path d="m5 12 4 4L19 6" />
            </svg>
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onSetStatus("rejected")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#fff1f0] text-[#b42318] transition hover:bg-[#ffe1de] disabled:opacity-50"
            aria-label={`Từ chối ${item.title}`}
            title="Từ chối"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </>
      )}
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#667085] transition hover:bg-white/64 hover:text-[#182230]"
        aria-label={`Xem chi tiết ${item.title}`}
        title="Chi tiết"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
          <circle cx="12" cy="5" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="12" cy="19" r="1.8" />
        </svg>
      </button>
    </div>
  );
}

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

export default function AdminPrayerTable({
  items,
  total,
  selectedIds,
  busyIds,
  page,
  pageSize,
  onTogglePrayer,
  onToggleAll,
  onPageChange,
  onOpen,
  onSetStatus,
  onDelete,
  onClearSelection,
}: AdminPrayerTableProps) {
  const pageItems = items.slice((page - 1) * pageSize, page * pageSize);
  const isAllSelected = items.length > 0 && selectedIds.length === items.length;
  const hasSelection = selectedIds.length > 0;
  const isBusy = (id: number) => busyIds.includes(id);
  const bulkBusy = selectedIds.some(isBusy);
  const bulkButton =
    "h-9 rounded-full px-4 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <section className="liquid-glass mt-6 overflow-hidden rounded-[28px]">
      {hasSelection && (
        <div className="flex flex-wrap items-center gap-2 border-b border-white/40 bg-[#eaf4ff]/70 px-5 py-3 text-sm font-extrabold text-[#0066cc]">
          <span className="mr-2">Đã chọn {selectedIds.length}</span>
          <button type="button" disabled={bulkBusy} onClick={() => onSetStatus(selectedIds, "approved")} className={`${bulkButton} bg-[#2d8f58] text-white hover:bg-[#257a4b]`}>
            Duyệt
          </button>
          <button type="button" disabled={bulkBusy} onClick={() => onSetStatus(selectedIds, "answered")} className={`${bulkButton} bg-white text-[#0066cc] hover:bg-[#f3f8ff]`}>
            Đã nhậm lời
          </button>
          <button type="button" disabled={bulkBusy} onClick={() => onSetStatus(selectedIds, "rejected")} className={`${bulkButton} bg-white text-[#b42318] hover:bg-[#fff6f5]`}>
            Từ chối
          </button>
          <button type="button" disabled={bulkBusy} onClick={() => onDelete(selectedIds)} className={`${bulkButton} bg-white text-[#b42318] hover:bg-[#fff6f5]`}>
            Xóa
          </button>
          <button type="button" onClick={onClearSelection} className={`${bulkButton} ml-auto text-[#526579] hover:bg-white/60`}>
            Bỏ chọn
          </button>
        </div>
      )}

      {pageItems.length === 0 ? (
        <p className="px-6 py-14 text-center text-sm font-bold text-[#667085]">
          {total === 0
            ? "Chưa có lời cầu thay nào được gửi."
            : "Không có lời cầu thay nào khớp với bộ lọc."}
        </p>
      ) : (
        <>
          <div className="hidden lg:block">
            <table className="w-full table-fixed border-collapse text-left">
              <thead>
                <tr className="border-b border-white/40 bg-white/28 text-xs font-extrabold uppercase tracking-[0.08em] text-[#738095]">
                  <th className="w-14 px-6 py-5">
                    <SelectCheckbox
                      checked={isAllSelected}
                      mixed={hasSelection && !isAllSelected}
                      label={isAllSelected ? "Bỏ chọn tất cả lời cầu thay" : "Chọn tất cả lời cầu thay"}
                      onClick={onToggleAll}
                    />
                  </th>
                  <th className="px-4 py-5">Lời cầu thay</th>
                  <th className="w-[130px] px-4 py-5">Ngày gửi</th>
                  <th className="w-[110px] px-4 py-5 text-center">Cầu thay</th>
                  <th className="w-[140px] px-4 py-5">Trạng thái</th>
                  <th className="w-[150px] px-4 py-5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={[
                        "border-b border-white/36 text-sm font-extrabold text-[#344054] transition-colors last:border-b-0",
                        isSelected ? "bg-[#eaf4ff]/52 hover:bg-[#e0f0ff]/70" : "bg-white/16 hover:bg-white/42",
                      ].join(" ")}
                    >
                      <td className="px-6 py-5">
                        <SelectCheckbox
                          checked={isSelected}
                          label={isSelected ? `Bỏ chọn ${item.title}` : `Chọn ${item.title}`}
                          onClick={() => onTogglePrayer(item.id)}
                        />
                      </td>
                      <td className="px-4 py-5">
                        <button type="button" onClick={() => onOpen(item)} className="block w-full min-w-0 text-left">
                          <p className="truncate text-base font-extrabold text-[#182230] hover:text-[#0066cc]">
                            {item.title}
                          </p>
                          <p className="mt-1 line-clamp-1 text-xs font-bold text-[#667085]">{item.content}</p>
                        </button>
                        <SenderLine item={item} />
                      </td>
                      <td className="px-4 py-5 text-[#526579]">{formatAdminDate(item.createdAt)}</td>
                      <td className="px-4 py-5 text-center text-[#526579]">
                        {item.intercessionCount}
                        <span className="block text-[11px] font-bold text-[#8a94a6]">{item.commentCount} bình luận</span>
                      </td>
                      <td className="px-4 py-5">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-5">
                        <RowActions
                          item={item}
                          busy={isBusy(item.id)}
                          onOpen={() => onOpen(item)}
                          onSetStatus={(status) => onSetStatus([item.id], status)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-3 lg:hidden">
            {pageItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <article
                  key={item.id}
                  className={[
                    "rounded-[22px] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_16px_34px_rgba(31,48,70,0.08)] transition-colors",
                    isSelected ? "border-[#0066cc]/30 bg-[#eaf4ff]/58" : "border-white/60 bg-white/34 hover:bg-white/50",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <SelectCheckbox
                      checked={isSelected}
                      label={isSelected ? `Bỏ chọn ${item.title}` : `Chọn ${item.title}`}
                      onClick={() => onTogglePrayer(item.id)}
                    />
                    <button type="button" onClick={() => onOpen(item)} className="min-w-0 flex-1 text-left">
                      <p className="truncate text-base font-extrabold text-[#182230]">{item.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-[#667085]">{item.content}</p>
                    </button>
                  </div>
                  <SenderLine item={item} />
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-extrabold text-[#526579]">
                    <span className="flex items-center gap-3">
                      <StatusBadge status={item.status} />
                      {formatAdminDate(item.createdAt)} · {item.intercessionCount} cầu thay
                    </span>
                    <RowActions
                      item={item}
                      busy={isBusy(item.id)}
                      onOpen={() => onOpen(item)}
                      onSetStatus={(status) => onSetStatus([item.id], status)}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      <div className="flex flex-col gap-4 border-t border-white/36 bg-white/20 px-5 py-4 text-sm font-extrabold text-[#526579] sm:flex-row sm:items-center sm:justify-between">
        <span>
          {items.length === total
            ? `${total} lời cầu thay`
            : `${items.length} / ${total} lời cầu thay khớp bộ lọc`}
        </span>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={items.length}
          className="justify-start gap-2 p-0 sm:justify-center"
          onPageChange={onPageChange}
        />
      </div>
    </section>
  );
}
