type PaginationProps = {
  page: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  maxVisiblePages?: number;
  /** "admin": gọn, dùng trong bảng quản trị. "site": nút tròn có viền cho trang công khai. */
  variant?: "admin" | "site";
  className?: string;
  onPageChange: (page: number) => void;
};

/** Các số trang cần hiện: cửa sổ quanh trang hiện tại, luôn kèm trang đầu và cuối. */
export function pageItems(page: number, totalPages: number, maxVisible: number) {
  if (totalPages <= maxVisible + 2) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const half = Math.floor(maxVisible / 2);
  const start = Math.max(2, Math.min(page - half, totalPages - maxVisible));
  const end = Math.min(totalPages - 1, start + maxVisible - 1);
  const items: Array<number | "gap"> = [1];
  if (start > 2) items.push("gap");
  for (let number = start; number <= end; number += 1) items.push(number);
  if (end < totalPages - 1) items.push("gap");
  items.push(totalPages);
  return items;
}

const styles = {
  admin: {
    nav: "flex items-center justify-center gap-4 px-6 py-5 text-sm font-extrabold text-[#2d343c]",
    arrow: "rounded-full px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40",
    page: "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
    active: "bg-[#0066cc] text-white shadow-[0_10px_22px_rgba(0,102,204,0.22)]",
    idle: "text-[#2d343c] hover:bg-white/64",
    prev: "<",
    next: ">",
  },
  site: {
    nav: "mt-16 flex flex-wrap items-center justify-center gap-3",
    arrow:
      "flex h-10 w-10 items-center justify-center rounded-full border border-white/90 bg-white/76 text-[#6e6e73] disabled:opacity-40",
    page: "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold",
    active: "border-[#0066cc] bg-[#0066cc] text-white",
    idle: "border-white/90 bg-white/76 text-[#6e6e73]",
    prev: "‹",
    next: "›",
  },
};

export default function Pagination({
  page,
  pageSize,
  total,
  totalPages: totalPagesProp,
  maxVisiblePages = 5,
  variant = "admin",
  className = "",
  onPageChange,
}: PaginationProps) {
  const totalPages =
    totalPagesProp ??
    (pageSize && typeof total === "number" ? Math.ceil(total / pageSize) : 1);

  if (totalPages <= 1) return null;

  const style = styles[variant];

  return (
    <nav className={[style.nav, className].join(" ")} aria-label="Phân trang">
      <button
        type="button"
        className={style.arrow}
        disabled={page === 1}
        onClick={() => onPageChange(Math.max(page - 1, 1))}
        aria-label="Trang trước"
      >
        {style.prev}
      </button>

      {pageItems(page, totalPages, maxVisiblePages).map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={[style.page, item === page ? style.active : style.idle].join(" ")}
            aria-current={item === page ? "page" : undefined}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        className={style.arrow}
        disabled={page === totalPages}
        onClick={() => onPageChange(Math.min(page + 1, totalPages))}
        aria-label="Trang sau"
      >
        {style.next}
      </button>
    </nav>
  );
}
