"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Pagination from "@/com/news/Pagination";
import LibraryResourceCard, {
  LibraryResourceArtwork,
} from "@/com/library/LibraryResourceCard";
import LibraryResourcePreview from "@/com/library/LibraryResourcePreview";
import { useLibraryBookmarks } from "@/com/library/useLibraryBookmarks";
import {
  categoryLabel,
  LibraryResource,
  libraryTypes,
  previewKind,
} from "@/com/library/libraryData";

const resourcesPerPage = 6;

const actionLabels: Record<LibraryResource["type"], string> = {
  PDF: "Tải tài liệu PDF",
  Video: "Xem toàn bộ video",
  Sách: "Mở bản đọc",
  "Bài giảng": "Nghe bài giảng",
  "Âm thanh": "Phát âm thanh",
};

type LibraryPageClientProps = {
  resources: LibraryResource[];
  loadError?: string | null;
};

export default function LibraryPageClient({ resources, loadError }: LibraryPageClientProps) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("Tất cả");
  const [page, setPage] = useState(1);
  const { bookmarkedIds, toggleBookmark } = useLibraryBookmarks();
  const [selected, setSelected] = useState<LibraryResource | null>(null);
  const categoryCount = useMemo(
    () => new Set(resources.map((resource) => resource.category || resource.type)).size,
    [resources],
  );

  useEffect(() => {
    if (!selected) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selected]);

  const filteredResources = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return resources.filter(
      (resource) =>
        (type === "Tất cả" || resource.type === type) &&
        (!normalizedQuery ||
          [resource.title, resource.description, resource.type, categoryLabel(resource.category)]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)),
    );
  }, [query, resources, type]);

  const totalPages = Math.max(1, Math.ceil(filteredResources.length / resourcesPerPage));
  const currentResources = filteredResources.slice(
    (page - 1) * resourcesPerPage,
    page * resourcesPerPage,
  );

  const chooseType = (nextType: string) => {
    setType(nextType);
    setPage(1);
  };

  return (
    <>
      <section className="relative z-10 mx-auto w-[calc(100%_-_2rem)] max-w-7xl pt-24 md:pt-28">
        <div className="liquid-glass px-6 py-12 text-center md:px-12 md:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0066cc]">
            Thư viện tài liệu tâm linh
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-normal md:text-6xl">
            Nguồn cảm hứng cho hành trình đức tin
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#626a75] md:text-base">
            Khám phá sách, bài giảng, âm thanh và tài liệu được tuyển chọn để
            giúp bạn học hỏi, suy ngẫm và trưởng thành mỗi ngày.
          </p>
          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-3">
            {[
              ["Tài liệu", resources.length],
              ["Đã lưu", bookmarkedIds.length],
              ["Danh mục", categoryCount],
            ].map(([label, value]) => (
              <div key={label} className="liquid-readable px-3 py-4">
                <p className="text-2xl font-semibold text-[#0066cc]">{value}</p>
                <p className="mt-1 text-xs font-medium text-[#6e6e73]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-8 w-[calc(100%_-_2rem)] max-w-7xl">
        <div className="liquid-glass flex flex-col gap-5 p-4 md:flex-row md:items-center">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Tìm kiếm tài liệu..."
            className="h-12 flex-1 rounded-full border border-white/90 bg-white/70 px-5 text-sm outline-none focus:border-[#0066cc]"
          />
          <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
            {libraryTypes.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => chooseType(item)}
                className={[
                  "h-11 shrink-0 rounded-full px-5 text-sm font-semibold",
                  type === item
                    ? "bg-[#0066cc] text-white shadow-[0_12px_24px_rgba(0,102,204,0.2)]"
                    : "border border-white/90 bg-white/64 text-[#626a75]",
                ].join(" ")}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto w-[calc(100%_-_2rem)] max-w-7xl py-10 md:py-14">
        {loadError && (
          <p className="mb-6 rounded-[14px] bg-[#fff0f1] px-5 py-4 text-sm text-[#c0263a]">
            Không tải được tài liệu từ máy chủ: {loadError}
          </p>
        )}
        {currentResources.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {currentResources.map((resource) => (
              <LibraryResourceCard
                key={resource.id}
                resource={resource}
                bookmarked={bookmarkedIds.includes(resource.id)}
                onBookmark={() => toggleBookmark(resource.id)}
                onOpen={() => setSelected(resource)}
              />
            ))}
          </div>
        ) : (
          <div className="liquid-glass p-12 text-center text-[#626a75]">
            {resources.length === 0
              ? "Thư viện chưa có tài liệu nào. Vui lòng quay lại sau."
              : "Không tìm thấy tài liệu phù hợp."}
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </section>

      <section className="relative z-10 mx-auto w-[calc(100%_-_2rem)] max-w-7xl pb-16 md:pb-24">
        <div className="liquid-glass grid gap-7 p-7 md:grid-cols-[1.2fr_0.8fr] md:items-center md:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0066cc]">
              Gợi ý tài liệu
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              Nhận nguồn học tập mới mỗi tuần
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#626a75]">
              Những tài liệu mới và bài giảng nổi bật sẽ được tuyển chọn để đồng
              hành cùng bạn.
            </p>
          </div>
          <form className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
            <input
              type="email"
              placeholder="Địa chỉ email của bạn"
              className="h-12 min-w-0 flex-1 rounded-full border border-white/90 bg-white/70 px-5 text-sm outline-none focus:border-[#0066cc]"
            />
            <button
              type="submit"
              className="h-12 rounded-full bg-[#0066cc] px-7 text-sm font-semibold text-white"
            >
              Đăng ký
            </button>
          </form>
        </div>
      </section>

      {selected && (
        <div
          className="fixed inset-0 z-[70] bg-[#07111f]/26 backdrop-blur-[8px]"
          role="dialog"
          aria-modal="true"
          aria-label={`Xem trước ${selected.title}`}
          onClick={() => setSelected(null)}
        >
          <aside
            className="absolute inset-y-0 right-0 flex w-full flex-col border-l border-white/80 bg-[linear-gradient(145deg,rgba(250,252,255,0.92),rgba(226,237,247,0.84))] p-4 shadow-[-30px_0_80px_rgba(7,17,31,0.22)] backdrop-blur-[32px] animate-[slideInRight_320ms_cubic-bezier(.22,.8,.3,1)] sm:p-6 md:w-[min(58vw,760px)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 pb-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0066cc]">
                  Xem trước tài liệu
                </p>
                <p className="mt-1 text-sm font-semibold text-[#1d1d1f]">{selected.type}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/90 bg-white/68 text-[32px] font-light leading-none shadow-sm transition-transform hover:rotate-90"
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <div className="liquid-glass min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              {previewKind(selected) ? (
                <LibraryResourcePreview resource={selected} className="rounded-[18px]" />
              ) : (
                <div className="relative aspect-[16/9] overflow-hidden rounded-[18px] shadow-[0_22px_50px_rgba(7,17,31,0.22)]">
                  <LibraryResourceArtwork resource={selected} sizes="760px" />
                </div>
              )}

              <div className="px-1 pb-4 pt-7">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0066cc]">
                  {categoryLabel(selected.category) || selected.type}
                </p>
                <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">{selected.title}</h2>
                {selected.description && (
                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#626a75]">
                    {selected.description}
                  </p>
                )}

                <div className="mt-6 grid grid-cols-3 gap-2">
                  {[
                    ["Định dạng", selected.type],
                    ["Dung lượng", selected.sizeLabel || "—"],
                    ["Cập nhật", new Date(selected.updatedAt || selected.createdAt).toLocaleDateString("vi-VN")],
                  ].map(([label, value]) => (
                    <div key={label} className="liquid-readable px-3 py-4 text-center">
                      <p className="text-[10px] uppercase tracking-wide text-[#7b8490]">{label}</p>
                      <p className="mt-2 text-xs font-semibold text-[#26313d]">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto_auto] gap-2 pt-4">
              <Link
                href={`/library/${selected.id}`}
                className="col-span-3 flex h-12 items-center justify-center rounded-full border border-white/90 bg-white/68 px-6 text-sm font-semibold text-[#0066cc] no-underline shadow-sm transition-colors hover:bg-white/90"
              >
                Đi tới trang chi tiết
                <span className="ml-2" aria-hidden="true">→</span>
              </Link>
              {!selected.url ? (
                <button
                  type="button"
                  onClick={() => toggleBookmark(selected.id)}
                  className="h-12 flex-1 rounded-full bg-[#0066cc] px-6 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(0,102,204,0.24)]"
                >
                  {bookmarkedIds.includes(selected.id) ? "Đã lưu tài liệu" : "Lưu vào thư viện"}
                </button>
              ) : (
                <a
                  href={selected.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-12 flex-1 items-center justify-center rounded-full bg-[#0066cc] px-6 text-sm font-semibold text-white no-underline shadow-[0_12px_26px_rgba(0,102,204,0.24)]"
                >
                  {actionLabels[selected.type]}
                </a>
              )}
              <button
                type="button"
                onClick={() => window.print()}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/90 bg-white/68 text-xs font-semibold text-[#52606d]"
                aria-label="In"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                  <path d="M7 9V4h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
                  <path d="M7 14h10v6H7z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (navigator.share) {
                    void navigator.share({ title: selected.title, url: `${window.location.origin}/library/${selected.id}` });
                  } else {
                    void navigator.clipboard.writeText(`${window.location.origin}/library/${selected.id}`);
                  }
                }}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/90 bg-white/68 text-xs font-semibold text-[#52606d]"
                aria-label="Chia sẻ"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="m8.7 10.7 6.6-4.3M8.7 13.3l6.6 4.3" />
                </svg>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
