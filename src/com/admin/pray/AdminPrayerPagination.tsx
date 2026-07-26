"use client";

type AdminPrayerPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function AdminPrayerPagination({
  page,
  totalPages,
  onPageChange,
}: AdminPrayerPaginationProps) {
  const visiblePages = [1, 2, 3].filter((pageNumber) => pageNumber <= totalPages);

  return (
    <div className="flex flex-col gap-4 bg-[#edf3ff] px-6 py-6 text-xs font-black text-[#616b7c] sm:flex-row sm:items-center sm:justify-between md:px-10">
      <p>Hiển thị 1 - 4 của 1,284 lời cầu nguyện</p>
      <nav className="flex items-center gap-2" aria-label="Phân trang lời cầu thay">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#dce4f2] bg-white text-[#8a94a6] disabled:opacity-45"
          aria-label="Trang trước"
        >
          ‹
        </button>
        {visiblePages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            className={[
              "flex h-9 w-9 items-center justify-center rounded-[8px] border text-sm font-black transition",
              page === pageNumber
                ? "border-[#101828] bg-[#101828] text-white"
                : "border-[#dce4f2] bg-white text-[#667085] hover:bg-[#f8fbff]",
            ].join(" ")}
            aria-current={page === pageNumber ? "page" : undefined}
          >
            {pageNumber}
          </button>
        ))}
        <span className="px-1 text-[#8a94a6]">...</span>
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          className="flex h-9 min-w-11 items-center justify-center rounded-[8px] border border-[#dce4f2] bg-white px-2 text-sm font-black text-[#667085]"
          aria-current={page === totalPages ? "page" : undefined}
        >
          {totalPages}
        </button>
        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#dce4f2] bg-white text-[#8a94a6] disabled:opacity-45"
          aria-label="Trang sau"
        >
          ›
        </button>
      </nav>
    </div>
  );
}
