type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-16 flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/90 bg-white/76 text-[#6e6e73] disabled:opacity-40"
        disabled={page === 1}
        aria-label="Trang trước"
      >
        ‹
      </button>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map(
        (pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            className={[
              "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold",
              page === pageNumber
                ? "border-[#0066cc] bg-[#0066cc] text-white"
                : "border-white/90 bg-white/76 text-[#6e6e73]",
            ].join(" ")}
          >
            {pageNumber}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/90 bg-white/76 text-[#6e6e73] disabled:opacity-40"
        disabled={page === totalPages}
        aria-label="Trang sau"
      >
        ›
      </button>
    </div>
  );
}
