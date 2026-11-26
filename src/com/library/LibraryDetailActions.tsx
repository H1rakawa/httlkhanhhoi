"use client";

import { LibraryResource } from "@/com/library/libraryData";
import { useLibraryBookmarks } from "@/com/library/useLibraryBookmarks";

export default function LibraryDetailActions({
  resource,
}: {
  resource: LibraryResource;
}) {
  const { bookmarkedIds, toggleBookmark } = useLibraryBookmarks();
  const saved = bookmarkedIds.includes(resource.id);

  const share = () => {
    if (navigator.share) {
      void navigator.share({ title: resource.title, url: window.location.href });
    } else {
      void navigator.clipboard.writeText(window.location.href);
    }
  };

  const actionLabel =
    resource.type === "Video"
      ? "Xem toàn bộ video"
      : resource.type === "Âm thanh" || resource.type === "Bài giảng"
        ? "Phát nội dung"
        : "Tải tài liệu";

  return (
    <div className="liquid-glass p-5 sm:p-6">
      {!resource.url ? (
        <p className="flex min-h-14 w-full items-center justify-center rounded-[14px] bg-[#07111f]/70 px-5 text-sm font-semibold text-white">
          Tài liệu chưa có file đính kèm
        </p>
      ) : (
        <a
          href={resource.url}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-14 w-full items-center justify-center gap-3 rounded-[14px] bg-[#07111f] px-5 text-sm font-semibold text-white no-underline shadow-[0_14px_28px_rgba(7,17,31,0.22)]"
        >
          <DownloadIcon />
          {actionLabel}
        </a>
      )}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => toggleBookmark(resource.id)}
          className="flex h-12 items-center justify-center gap-2 rounded-[12px] border border-white/90 bg-white/66 text-sm font-semibold"
        >
          <BookmarkIcon filled={saved} />
          {saved ? "Đã lưu" : "Lưu"}
        </button>
        <button
          type="button"
          onClick={share}
          className="flex h-12 items-center justify-center gap-2 rounded-[12px] border border-white/90 bg-white/66 text-sm font-semibold"
        >
          <ShareIcon />
          Chia sẻ
        </button>
      </div>
      <p className="mt-5 text-center text-xs leading-6 text-[#626a75]">
        Tài liệu đã lưu được ghi nhớ trên trình duyệt này.
      </p>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path d="M12 4v11M8 11l4 4 4-4M5 19h14" />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path d="M7 4h10v16l-5-3-5 3z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.7 10.7 6.6-4.3M8.7 13.3l6.6 4.3" />
    </svg>
  );
}
