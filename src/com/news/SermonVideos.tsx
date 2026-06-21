"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LibraryResource } from "@/com/library/libraryData";

type YouTubeSermonFeed = {
  channelUrl: string;
  live: LibraryResource;
  videos: LibraryResource[];
};

const fallbackVideo: LibraryResource = {
  id: "sermon-fallback",
  title: "Bài giảng HTTL Khánh Hội",
  description:
    "Các bài giảng và chương trình thờ phượng mới nhất từ kênh YouTube HTTL Khánh Hội.",
  type: "Bài giảng",
  url: "https://www.youtube.com/@httlkhanhhoi4369",
  image:
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=86",
  createdAt: new Date().toISOString(),
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default function SermonVideos() {
  const [videos, setVideos] = useState<LibraryResource[]>([fallbackVideo]);
  const [channelUrl, setChannelUrl] = useState("https://www.youtube.com/@httlkhanhhoi4369");

  useEffect(() => {
    fetch("/api/youtube/sermons", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()) as YouTubeSermonFeed;
      })
      .then((feed) => {
        if (!feed) return;
        setChannelUrl(feed.channelUrl);
        setVideos([feed.live, ...feed.videos].filter(Boolean).slice(0, 5));
      })
      .catch(() => undefined);
  }, []);

  const featured = videos[0] || fallbackVideo;
  const related = videos.slice(1, 5);

  return (
    <section className="px-5 pb-6 pt-16 md:pt-20">
      <div className="liquid-glass mx-auto max-w-7xl p-5 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0066cc]">
              Bài giảng
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal md:text-4xl">
              Lắng nghe Lời Chúa qua YouTube
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#626a75]">
              Video mới nhất và livestream từ kênh HTTL Khánh Hội được cập nhật tự động.
            </p>
          </div>
          <a
            href={channelUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#07111f] px-6 text-sm font-semibold text-white no-underline"
          >
            Mở kênh YouTube
          </a>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.55fr_0.9fr]">
          <article className="liquid-readable overflow-hidden p-3">
            <div className="relative aspect-video overflow-hidden rounded-[18px] bg-[#07111f] shadow-[0_24px_60px_rgba(7,17,31,0.2)]">
              {featured.embedUrl ? (
                <iframe
                  src={featured.embedUrl}
                  title={featured.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              ) : (
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover"
                />
              )}
            </div>
            <div className="px-2 pb-3 pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0066cc]">
                {featured.id === "youtube-live" ? "Livestream" : "Video mới"}
              </p>
              <h3 className="mt-2 text-2xl font-semibold leading-snug">
                {featured.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#626a75]">
                {featured.description}
              </p>
            </div>
          </article>

          <div className="liquid-readable p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Video gần đây</h3>
              <Link href="/library" className="text-sm font-semibold text-[#0066cc] no-underline">
                Xem thư viện
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {related.length > 0 ? (
                related.map((video) => (
                  <a
                    key={video.id}
                    href={video.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex gap-3 rounded-[16px] border border-white/80 bg-white/54 p-3 text-[#1d1d1f] no-underline transition-transform hover:-translate-y-1"
                  >
                    <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-[12px] bg-[#dfe8f3]">
                      <Image
                        src={video.image}
                        alt={video.title}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xl text-white drop-shadow">
                        ▶
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-semibold leading-5">{video.title}</p>
                      <p className="mt-2 text-xs text-[#7b8490]">{formatDate(video.createdAt)}</p>
                    </div>
                  </a>
                ))
              ) : (
                <p className="rounded-[16px] border border-white/80 bg-white/54 p-5 text-sm leading-7 text-[#626a75]">
                  Chưa tải được danh sách video. Bạn vẫn có thể mở kênh YouTube để xem trực tiếp.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
