type PaginationProps = {
  page: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  maxVisiblePages?: number;
  className?: string;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  page,
  pageSize,
  total,
  totalPages: totalPagesProp,
  maxVisiblePages = 5,
  className = "",
  onPageChange,
}: PaginationProps) {
  const totalPages =
    totalPagesProp ??
    (pageSize && typeof total === "number" ? Math.ceil(total / pageSize) : 1);

  if (totalPages <= 1) return null;

  const visiblePages = Array.from(
    { length: Math.min(totalPages, maxVisiblePages) },
    (_, index) => index + 1,
  );

  return (
    <nav
      className={[
        "flex items-center justify-center gap-4 px-6 py-5 text-sm font-extrabold text-[#2d343c]",
        className,
      ].join(" ")}
      aria-label="Phân trang"
    >
      <button
        type="button"
        className="rounded-full px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={page === 1}
        onClick={() => onPageChange(Math.max(page - 1, 1))}
        aria-label="Trang trước"
      >
        &lt;
      </button>

      {visiblePages.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          onClick={() => onPageChange(pageNumber)}
          className={[
            "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
            pageNumber === page
              ? "bg-[#0066cc] text-white shadow-[0_10px_22px_rgba(0,102,204,0.22)]"
              : "text-[#2d343c] hover:bg-white/64",
          ].join(" ")}
          aria-current={pageNumber === page ? "page" : undefined}
        >
          {pageNumber}
        </button>
      ))}

      {totalPages > visiblePages.length && (
        <>
          <span>...</span>
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            className={[
              "rounded-full px-2 py-1",
              totalPages === page ? "text-[#0066cc]" : "",
            ].join(" ")}
            aria-current={totalPages === page ? "page" : undefined}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        className="rounded-full px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={page === totalPages}
        onClick={() => onPageChange(Math.min(page + 1, totalPages))}
        aria-label="Trang sau"
      >
        &gt;
      </button>
    </nav>
  );
}
