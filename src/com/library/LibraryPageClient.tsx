"use client";

import { useEffect, useMemo, useState } from "react";
import Pagination from "@/com/news/Pagination";
import LibraryResourceCard, {
  LibraryResourceArtwork,
} from "@/com/library/LibraryResourceCard";
import {
  fallbackResources,
  LibraryResource,
  libraryTypes,
  normalizeResourceType,
} from "@/com/library/libraryData";

type ApiResource = {
  id: number;
  title: string;
  type: string;
  url: string;
  created_at: string;
};

const resourcesPerPage = 6;

export default function LibraryPageClient() {
  const [resources, setResources] = useState(fallbackResources);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("Tất cả");
  const [page, setPage] = useState(1);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<LibraryResource | null>(null);

  useEffect(() => {
    fetch("/api/resources", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()) as ApiResource[];
      })
      .then((data) => {
        if (!data?.length) return;
        setResources(
          data.map((resource, index) => ({
            id: String(resource.id),
            title: resource.title,
            description:
              "Tài liệu được tuyển chọn từ thư viện HTTL. Khánh Hội, hỗ trợ học hỏi và trưởng thành trong đức tin.",
            type: normalizeResourceType(resource.type),
            url: resource.url,
            image: fallbackResources[index % fallbackResources.length].image,
            createdAt: resource.created_at,
          })),
        );
      })
      .catch(() => undefined);
  }, []);

  const filteredResources = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return resources.filter(
      (resource) =>
        (type === "Tất cả" || resource.type === type) &&
        (!normalizedQuery ||
          [resource.title, resource.description, resource.type]
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

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((current) =>
      current.includes(id)
        ? current.filter((resourceId) => resourceId !== id)
        : [...current, id],
    );
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
              ["Danh mục", libraryTypes.length - 1],
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
            Không tìm thấy tài liệu phù hợp.
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
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#07111f]/30 px-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={`Chi tiết ${selected.title}`}
          onClick={() => setSelected(null)}
        >
          <div
            className="liquid-glass grid w-full max-w-3xl gap-6 p-5 md:grid-cols-[0.9fr_1.1fr] md:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative min-h-56 overflow-hidden rounded-[16px]">
              <LibraryResourceArtwork resource={selected} sizes="500px" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0066cc]">
                    {selected.type}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold">{selected.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white bg-white/70 text-lg"
                  aria-label="Đóng"
                >
                  ×
                </button>
              </div>
              <p className="mt-5 text-sm leading-7 text-[#626a75]">
                {selected.description}
              </p>
              {selected.url === "#" ? (
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="mt-auto h-12 rounded-full bg-[#0066cc] px-6 text-sm font-semibold text-white"
                >
                  Đã hiểu
                </button>
              ) : (
                <a
                  href={selected.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-auto flex h-12 items-center justify-center rounded-full bg-[#0066cc] px-6 text-sm font-semibold text-white no-underline"
                >
                  Mở tài liệu
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
