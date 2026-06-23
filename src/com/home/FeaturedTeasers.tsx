import { Card, CardContent, CardFooter, CardHeader } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import {
  MotionGroup,
  MotionItem,
  MotionSection,
} from "@/com/shared/MotionSection";
import { ClockIcon, PinIcon } from "@/com/shared/Icons";
import { events, sermons } from "@/com/shared/data";

export default function FeaturedTeasers() {
  return (
    <MotionSection
      className="liquid-glass mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-12"
      id="sermons"
    >
      <div className="mx-auto">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-semibold tracking-normal text-[#1d1d1f]">
              Bài Giảng Mới Nhất
            </h2>
            <p className="mt-2 text-sm text-[#6e6e73]">
              Đào sâu đức tin qua những chia sẻ từ các mục sư
            </p>
          </div>
          <Link
            href="/news"
            className="inline-flex h-10 w-fit items-center justify-center gap-1 rounded-full px-3 text-sm font-semibold text-[#0066cc] no-underline hover:bg-[#f0f6ff]"
          >
            Xem tất cả <span aria-hidden="true">›</span>
          </Link>
        </div>

        <MotionGroup className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          {sermons.map((sermon) => (
            <MotionItem key={sermon.title} className="h-full">
              <Card
                variant="transparent"
                className="liquid-glass-item group h-full overflow-hidden border-2 border-white/90"
              >
                <CardHeader className="relative aspect-video overflow-hidden p-0">
                  <Image
                    src={sermon.image}
                    alt={sermon.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                </CardHeader>
                <CardContent className="gap-3 px-5 pb-3 pt-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-[0.12em]">
                    <p className="text-[#0066cc]">Series: {sermon.category}</p>
                    <p className="text-[#8a8a8f]">{sermon.date}</p>
                  </div>
                  <h3 className="text-lg font-semibold leading-7 tracking-normal">
                    {sermon.title}
                  </h3>
                  <p className="text-sm leading-6 text-[#6e6e73]">
                    {sermon.excerpt}
                  </p>
                </CardContent>
                <CardFooter className="flex items-center justify-between gap-3 border-t border-white/80 px-5 py-4 text-xs">
                  <span className="text-[#6e6e73]">{sermon.pastor}</span>
                  <Link
                    href="/news"
                    className="font-semibold text-[#0066cc] no-underline hover:underline"
                  >
                    Xem bài giảng ›
                  </Link>
                </CardFooter>
              </Card>
            </MotionItem>
          ))}
        </MotionGroup>
      </div>
    </MotionSection>
  );
}

export function EventList() {
  return (
    <MotionSection
      className="liquid-glass mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-12"
      id="schedule"
    >
      <div className="mx-auto">
        <div>
          <h2 className="text-3xl font-semibold tracking-normal text-[#1d1d1f]">
            Sự Kiện Sắp Tới
          </h2>
          <p className="mt-2 text-sm text-[#6e6e73]">
            Hãy cùng tham gia và kết nối
          </p>
        </div>
        <MotionGroup className="mt-7 space-y-4">
          {events.map((event) => (
            <MotionItem key={event.title}>
              <Card
                variant="transparent"
                className="liquid-glass-item border-2 border-white/90"
              >
                <CardContent className="grid gap-5 p-5 sm:grid-cols-[82px_minmax(0,1fr)_auto] sm:items-center md:p-6">
                  <div className="flex min-h-16 flex-col justify-center border-b border-[#dedee3] pb-4 text-center sm:border-b-0 sm:border-r sm:pb-0 sm:pr-5">
                    <p className="text-3xl font-semibold leading-none">
                      {event.day}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase text-[#0066cc]">
                      {event.month}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#0066cc]">
                      {event.category}
                    </p>
                    <h3 className="mt-1 text-base font-semibold">
                      {event.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#6e6e73]">
                      {event.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#6e6e73]">
                      <span className="inline-flex items-center gap-1.5">
                        <PinIcon className="h-4 w-4 text-[#0066cc]" />
                        {event.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <ClockIcon className="h-4 w-4 text-[#0066cc]" />
                        {event.time}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/calendar"
                    className="inline-flex h-9 w-full shrink-0 items-center justify-center rounded-full bg-[#0066cc] px-5 text-xs font-semibold text-white no-underline transition-colors hover:bg-[#0077ee] sm:w-auto justify-self-center sm:justify-self-auto"
                  >
                    Tìm hiểu thêm
                  </Link>
                </CardContent>
              </Card>
            </MotionItem>
          ))}
        </MotionGroup>
      </div>
    </MotionSection>
  );
}
