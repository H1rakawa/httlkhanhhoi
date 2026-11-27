import PrayerFilterBar from "@/com/pray/PrayerFilterBar";
import PrayerRequestCard from "@/com/pray/PrayerRequestCard";
import type { PrayerRequest } from "@/com/pray/prayData";

export type PrayerFilter = "all" | "mine" | "praying" | "answered";

type PrayerRequestListProps = {
  requests: PrayerRequest[];
  totalCount: number;
  filter: PrayerFilter;
  query: string;
  page: number;
  pageCount: number;
  loadError: string | null;
  actionError: string;
  onFilterChange: (value: PrayerFilter) => void;
  onQueryChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onOpen: (request: PrayerRequest) => void;
  onToggleIntercession: (request: PrayerRequest) => void;
};

export default function PrayerRequestList({
  requests,
  totalCount,
  filter,
  query,
  page,
  pageCount,
  loadError,
  actionError,
  onFilterChange,
  onQueryChange,
  onPageChange,
  onOpen,
  onToggleIntercession,
}: PrayerRequestListProps) {
  const error = loadError || actionError;

  return (
    <section className="grid content-start gap-6">
      <PrayerFilterBar
        filter={filter}
        query={query}
        onFilterChange={onFilterChange}
        onQueryChange={onQueryChange}
      />

      {error && (
        <p role="alert" className="rounded-[14px] bg-[#fff1f0] px-5 py-4 text-sm font-semibold text-[#b42318]">
          {error}
        </p>
      )}

      <div className="grid gap-6">
        {requests.map((request) => (
          <PrayerRequestCard
            key={request.id}
            request={request}
            onOpen={onOpen}
            onToggleIntercession={onToggleIntercession}
          />
        ))}
      </div>

      {requests.length === 0 && !loadError && (
        <div className="liquid-glass p-10 text-center">
          <p className="text-lg font-semibold">
            {totalCount === 0 ? "Chưa có lời cầu thay nào" : "Không tìm thấy lời cầu thay phù hợp"}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#626a75]">
            {totalCount === 0
              ? "Hãy là người đầu tiên chia sẻ ý nguyện để cộng đồng cùng cầu thay."
              : "Hãy thử bộ lọc hoặc từ khoá khác."}
          </p>
        </div>
      )}

      {pageCount > 1 && (
        <nav
          aria-label="Phân trang lời cầu thay"
          className="liquid-readable flex items-center justify-center gap-2 p-3"
        >
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((item) => (
            <button
              key={item}
              type="button"
              aria-current={item === page ? "page" : undefined}
              onClick={() => {
                onPageChange(item);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={[
                "h-10 w-10 rounded-full text-sm font-bold",
                item === page ? "bg-[#111113] text-white" : "bg-white/60 text-[#626a75]",
              ].join(" ")}
            >
              {item}
            </button>
          ))}
        </nav>
      )}
    </section>
  );
}
