import Image from "next/image";
import Link from "next/link";
import { DownloadIcon, PlayIcon } from "@/com/preachout/PreachoutIcons";
import { OutreachResource } from "@/com/preachout/preachoutData";

type ResourcesDownloadSectionProps = {
  resources: OutreachResource[];
};

export default function ResourcesDownloadSection({
  resources,
}: ResourcesDownloadSectionProps) {
  return (
    <section id="resources" className="relative z-10 px-5 py-12 md:py-16">
      <div className="mx-auto max-w-7xl">
        <p className="border-l-4 border-[#ff2d55] pl-5 text-sm font-semibold">
          Tài liệu Truyền giảng
        </p>
        <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_0.95fr]">
          <article className="liquid-glass p-6">
            <div className="relative flex min-h-72 items-center justify-center overflow-hidden rounded-[20px] bg-[#111113]">
              <Image
                src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=88"
                alt="Video giới thiệu sứ mệnh"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover opacity-72"
              />
              <div className="absolute inset-0 bg-black/24" />
              <button className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full border border-white/80 bg-white/52 text-[#111113] shadow-2xl backdrop-blur-xl transition-transform hover:scale-105">
                <PlayIcon />
              </button>
            </div>
            <h2 className="mt-6 text-xl font-semibold">Video Giới thiệu Sứ mệnh</h2>
            <p className="mt-3 text-sm leading-7 text-[#626a75]">
              Tóm tắt các hoạt động nổi bật và tầm nhìn của HTTL. Khánh Hội
              trong năm qua.
            </p>
            <div className="mt-6 flex items-center justify-between text-sm">
              <span className="font-medium text-[#626a75]">4K Ultra HD • 12:45</span>
              <a href="#" className="inline-flex items-center gap-2 font-semibold text-[#ff2d55] no-underline">
                <DownloadIcon />
                Tải xuống
              </a>
            </div>
          </article>

          <aside className="liquid-glass p-6">
            <div className="space-y-4">
              {resources.map((resource) => (
                <a
                  key={resource.title}
                  href="#"
                  className="flex items-center gap-4 rounded-[16px] border border-white/80 bg-white/52 p-4 text-[#1d1d1f] no-underline transition-transform hover:-translate-y-1 hover:bg-white/72"
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] ${resource.tone}`}>
                    <DownloadIcon />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{resource.title}</span>
                    <span className="mt-1 block text-xs text-[#7b8490]">{resource.meta}</span>
                  </span>
                  <DownloadIcon />
                </a>
              ))}
            </div>
            <Link
              href="/library"
              className="mt-6 flex h-12 items-center justify-center rounded-[14px] border border-white/90 bg-white/58 text-xs font-bold uppercase tracking-[0.22em] text-[#424245] no-underline"
            >
              Xem tất cả tài liệu
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
