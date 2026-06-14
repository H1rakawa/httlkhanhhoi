"use client";

import Image from "next/image";
import { MouseEvent, useState } from "react";
import { LibraryResource } from "@/com/library/libraryData";

const artworkStyles: Record<LibraryResource["type"], string> = {
  PDF: "from-[#dbe9ff] via-[#f8fbff] to-[#a9c9ff]",
  Video: "from-[#07111f] via-[#075b8a] to-[#7de7ff]",
  Sách: "from-[#2b180d] via-[#8b5d35] to-[#ead7bd]",
  "Bài giảng": "from-[#d9e5f0] via-white to-[#8cacc3]",
  "Âm thanh": "from-[#0d1c33] via-[#405ea1] to-[#b9d3ff]",
};

export function LibraryResourceArtwork({
  resource,
  sizes,
}: {
  resource: LibraryResource;
  sizes: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className={`absolute inset-0 overflow-hidden bg-gradient-to-br ${artworkStyles[resource.type]}`}>
      <div className="absolute -left-12 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full border border-white/50 bg-white/18 blur-sm" />
      <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full border border-white/30 bg-white/14 blur-md" />
      <div className="absolute inset-x-8 bottom-6 h-16 rounded-[50%] bg-[#07111f]/20 blur-2xl" />
      <svg
        viewBox="0 0 80 80"
        fill="none"
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 text-white/88 drop-shadow-[0_14px_18px_rgba(7,17,31,0.3)]"
      >
        {resource.type === "Video" ? (
          <>
            <circle cx="40" cy="40" r="29" stroke="currentColor" strokeWidth="4" />
            <path d="m34 27 20 13-20 13V27Z" fill="currentColor" />
          </>
        ) : resource.type === "Âm thanh" ? (
          <>
            <path d="M25 29v27M36 20v40M47 26v30M58 34v16" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M21 17h30a8 8 0 0 1 8 8v41H29a8 8 0 0 1-8-8V17Z" fill="currentColor" fillOpacity=".25" stroke="currentColor" strokeWidth="4" />
            <path d="M30 29h20M30 40h20M30 51h14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </>
        )}
      </svg>
      {!failed && (
        <Image
          src={resource.image}
          alt={resource.title}
          fill
          unoptimized
          sizes={sizes}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`object-cover transition-all duration-700 group-hover:scale-[1.04] ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07111f]/20 via-transparent to-white/10" />
    </div>
  );
}

export default function LibraryResourceCard({
  resource,
  bookmarked,
  onBookmark,
  onOpen,
}: {
  resource: LibraryResource;
  bookmarked: boolean;
  onBookmark: () => void;
  onOpen: () => void;
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const updateTilt = (event: MouseEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setTilt({
      x: ((event.clientY - bounds.top) / bounds.height - 0.5) * -5,
      y: ((event.clientX - bounds.left) / bounds.width - 0.5) * 5,
    });
  };

  return (
    <article
      onMouseMove={updateTilt}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className="liquid-glass-item group flex min-h-[390px] flex-col p-3"
      style={{
        transform: `perspective(1100px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${tilt.x || tilt.y ? -5 : 0}px)`,
        transition: "transform 180ms ease, box-shadow 180ms ease",
      }}
    >
      <button
        type="button"
        onClick={onOpen}
        className="relative block aspect-[16/10] w-full overflow-hidden rounded-[14px] text-left"
        aria-label={`Xem ${resource.title}`}
      >
        <LibraryResourceArtwork
          resource={resource}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        <span className="absolute right-3 top-3 rounded-full border border-white/70 bg-[#07111f]/78 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-lg">
          {resource.type}
        </span>
        <span className="absolute inset-x-4 bottom-3 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
      </button>

      <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0066cc]">
          {resource.type}
        </p>
        <h2 className="mt-2 text-lg font-semibold leading-snug">{resource.title}</h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#626a75]">
          {resource.description}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <button
            type="button"
            onClick={onOpen}
            className="text-sm font-semibold text-[#0066cc]"
          >
            Xem thêm <span aria-hidden="true">→</span>
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onBookmark}
              className={[
                "flex h-9 w-9 items-center justify-center rounded-full border border-white/90",
                bookmarked
                  ? "bg-[#0066cc] text-white"
                  : "bg-white/66 text-[#4f5865]",
              ].join(" ")}
              aria-label={bookmarked ? "Bỏ lưu tài liệu" : "Lưu tài liệu"}
            >
              <svg viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                <path d="M7 4h10v16l-5-3-5 3z" />
              </svg>
            </button>
            {resource.url === "#" ? (
              <button
                type="button"
                onClick={onOpen}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/90 bg-white/66 text-[#4f5865]"
                aria-label={`Xem tài liệu ${resource.title}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                  <path d="M12 4v11M8 11l4 4 4-4M5 19h14" />
                </svg>
              </button>
            ) : (
              <a
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/90 bg-white/66 text-[#4f5865] no-underline"
                aria-label={`Mở tài liệu ${resource.title}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                  <path d="M12 4v11M8 11l4 4 4-4M5 19h14" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
