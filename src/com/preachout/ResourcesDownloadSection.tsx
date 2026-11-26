import Image from "next/image";
import Link from "next/link";
import { DownloadIcon, PlayIcon } from "@/com/preachout/PreachoutIcons";
import { OutreachResource } from "@/com/preachout/preachoutData";

type ResourcesDownloadSectionProps = {
  resources: OutreachResource[];
};

export default function ResourcesDownloadSection({ resources }: ResourcesDownloadSectionProps) {
  const featuredVideo = resources.find((resource) => resource.isVideo) ?? null;
  const listed = resources.filter((resource) => resource.id !== featuredVideo?.id).slice(0, 4);

  return (
    <section id="resources" className="relative z-10 px-5 py-12 md:py-16">
      <div className="mx-auto max-w-7xl">
        <p className="border-l-4 border-[#ff2d55] pl-5 text-sm font-semibold">
          Tài liệu Truyền giảng
        </p>

        {resources.length === 0 ? (
          <div className="liquid-glass mt-8 p-8 text-center text-sm text-[#626a75]">
            Thư viện chưa có tài liệu nào được chia sẻ.
          </div>
        ) : (
          <div
            className={[
              "mt-8 grid gap-7",
              featuredVideo ? "lg:grid-cols-[1fr_0.95fr]" : "",
            ].join(" ")}
          >
            {featuredVideo && (
              <article className="liquid-glass p-6">
                <a
                  href={featuredVideo.href ?? "/library"}
                  target={featuredVideo.href ? "_blank" : undefined}
                  rel="noreferrer"
                  className="relative flex min-h-72 items-center justify-center overflow-hidden rounded-[20px] bg-[#111113]"
                  aria-label={`Xem video ${featuredVideo.title}`}
                >
                  {featuredVideo.thumbnailUrl && (
                    <Image
                      src={featuredVideo.thumbnailUrl}
                      alt={featuredVideo.title}
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover opacity-72"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/24" />
                  <span className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full border border-white/80 bg-white/52 text-[#111113] shadow-2xl backdrop-blur-xl transition-transform hover:scale-105">
                    <PlayIcon />
                  </span>
                </a>
                <h2 className="mt-6 text-xl font-semibold">{featuredVideo.title}</h2>
                {featuredVideo.description && (
                  <p className="mt-3 text-sm leading-7 text-[#626a75]">
                    {featuredVideo.description}
                  </p>
                )}
                <div className="mt-6 flex items-center justify-between text-sm">
                  <span className="font-medium text-[#626a75]">{featuredVideo.meta}</span>
                  {featuredVideo.href && (
                    <a
                      href={featuredVideo.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 font-semibold text-[#ff2d55] no-underline"
                    >
                      <DownloadIcon />
                      Tải xuống
                    </a>
                  )}
                </div>
              </article>
            )}

            <aside className="liquid-glass p-6">
              <div className={featuredVideo ? "space-y-4" : "grid gap-4 md:grid-cols-2"}>
                {listed.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.href ?? "/library"}
                    target={resource.href ? "_blank" : undefined}
                    rel="noreferrer"
                    className="flex items-center gap-4 rounded-[16px] border border-white/80 bg-white/52 p-4 text-[#1d1d1f] no-underline transition-transform hover:-translate-y-1 hover:bg-white/72"
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] ${resource.tone}`}
                    >
                      <DownloadIcon />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{resource.title}</span>
                      <span className="mt-1 block text-xs text-[#7b8490]">{resource.meta}</span>
                    </span>
                    <DownloadIcon />
                  </a>
                ))}
                {listed.length === 0 && (
                  <p className="text-sm text-[#626a75]">Xem thêm tài liệu trong thư viện.</p>
                )}
              </div>
              <Link
                href="/library"
                className="mt-6 flex h-12 items-center justify-center rounded-[14px] border border-white/90 bg-white/58 text-xs font-bold uppercase tracking-[0.22em] text-[#424245] no-underline"
              >
                Xem tất cả tài liệu
              </Link>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
