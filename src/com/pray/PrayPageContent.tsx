"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import PrayerRequestDetail from "@/com/pray/PrayerRequestDetail";
import PrayerRequestForm from "@/com/pray/PrayerRequestForm";
import PrayerRequestList, { type PrayerFilter } from "@/com/pray/PrayerRequestList";
import type { PrayerRequest } from "@/com/pray/prayData";

type PrayerPatch = Partial<Pick<PrayerRequest, "hasInterceded" | "intercessionCount" | "commentCount">>;

type PrayPageContentProps = {
  initialRequests: PrayerRequest[];
  loadError: string | null;
  initialOpenId: string | null;
};

const PAGE_SIZE = 5;

export default function PrayPageContent({
  initialRequests,
  loadError,
  initialOpenId,
}: PrayPageContentProps) {
  const router = useRouter();
  // Thay đổi tạm thời (cầu thay, thêm lời động viên) cho tới khi server trả dữ liệu mới.
  const [patches, setPatches] = useState<Record<string, PrayerPatch>>({});
  const [source, setSource] = useState(initialRequests);
  if (source !== initialRequests) {
    setSource(initialRequests);
    setPatches({});
  }

  const requests = useMemo(
    () => initialRequests.map((request) => ({ ...request, ...patches[request.id] })),
    [initialRequests, patches],
  );

  const [selectedId, setSelectedId] = useState<string | null>(
    initialOpenId && initialRequests.some((request) => request.id === initialOpenId)
      ? initialOpenId
      : null,
  );
  const [filter, setFilter] = useState<PrayerFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState("");

  const selectedRequest = requests.find((request) => request.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedRequest) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedRequest]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "mine" && request.isMine) ||
        (filter === "praying" && (request.status === "approved" || request.status === "pending")) ||
        (filter === "answered" && request.status === "answered");
      const matchesQuery =
        !normalized ||
        [request.title, request.content, request.category, request.authorName ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query, requests]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const patch = useCallback((id: string, value: PrayerPatch) => {
    setPatches((current) => ({ ...current, [id]: { ...current[id], ...value } }));
  }, []);

  const toggleIntercession = useCallback(
    async (request: PrayerRequest) => {
      setActionError("");
      const next = !request.hasInterceded;
      const previous = {
        hasInterceded: request.hasInterceded,
        intercessionCount: request.intercessionCount,
      };
      patch(request.id, {
        hasInterceded: next,
        intercessionCount: Math.max(0, request.intercessionCount + (next ? 1 : -1)),
      });

      const response = await fetch(`/api/prayers/${request.id}/intercession`, {
        method: next ? "POST" : "DELETE",
      }).catch(() => null);
      if (!response?.ok) {
        const data = (await response?.json().catch(() => null)) as { error?: string } | null;
        patch(request.id, previous);
        setActionError(data?.error || "Không thể ghi nhận cầu thay. Vui lòng thử lại.");
      }
    },
    [patch],
  );

  return (
    <>
      <section className="relative z-10 px-5 pb-12 pt-28 md:pb-16 md:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#6c4cff]">
            Cầu Thay & Đồng Hành
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal md:text-6xl">
            Nơi tình thương được lan tỏa qua lời cầu nguyện
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#626a75]">
            Hãy để cộng đồng cùng bạn đi qua những thử thách, nâng đỡ nhau bằng
            lời cầu thay, sự lắng nghe và những lời động viên chân thành.
          </p>
        </div>
      </section>

      <section className="relative z-10 px-5 pb-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <PrayerRequestForm onCreated={() => router.refresh()} />
          </div>
          <PrayerRequestList
            requests={visible}
            totalCount={requests.length}
            filter={filter}
            query={query}
            page={currentPage}
            pageCount={pageCount}
            loadError={loadError}
            actionError={actionError}
            onFilterChange={(value) => {
              setFilter(value);
              setPage(1);
            }}
            onQueryChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            onPageChange={setPage}
            onOpen={(request) => setSelectedId(request.id)}
            onToggleIntercession={toggleIntercession}
          />
        </div>
      </section>

      <PrayerRequestDetail
        key={selectedRequest?.id || "closed"}
        request={selectedRequest}
        onClose={() => setSelectedId(null)}
        onToggleIntercession={toggleIntercession}
        onCommentCount={(id, count) => patch(id, { commentCount: count })}
        onChanged={() => {
          setSelectedId(null);
          router.refresh();
        }}
        onRefresh={() => router.refresh()}
      />
    </>
  );
}
