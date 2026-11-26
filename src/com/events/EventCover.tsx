import Image from "next/image";
import type { ReactNode } from "react";
import type { ChurchEvent, EventCategory } from "@/lib/events/types";

const categoryCover: Record<EventCategory, string> = {
  "Thờ phượng": "calendar-event-worship",
  "Đào tạo": "calendar-event-workshop",
  "Thiện nguyện": "calendar-event-charity",
  "Giới trẻ": "calendar-event-youth",
};

type EventCoverProps = {
  event: Pick<ChurchEvent, "title" | "category" | "imageUrl">;
  className?: string;
  sizes?: string;
  imageClassName?: string;
  children?: ReactNode;
};

/** Ảnh bìa sự kiện: dùng image_url / media asset nếu có, nếu không thì nền theo danh mục. */
export default function EventCover({
  event,
  className = "",
  sizes = "100vw",
  imageClassName = "object-cover",
  children,
}: EventCoverProps) {
  return (
    <div
      className={[
        "relative overflow-hidden",
        event.imageUrl ? "bg-[#111113]" : categoryCover[event.category],
        className,
      ].join(" ")}
    >
      {event.imageUrl && (
        <Image
          src={event.imageUrl}
          alt={event.title}
          fill
          sizes={sizes}
          unoptimized
          className={imageClassName}
        />
      )}
      {children}
    </div>
  );
}
