import Image from "next/image";
import { initials } from "@/com/pray/prayData";

export default function PrayerAvatar({
  name,
  src,
  size,
  anonymous = false,
}: {
  name: string | null;
  src: string | null;
  size: number;
  anonymous?: boolean;
}) {
  const style = { width: size, height: size };

  if (src) {
    return (
      <Image
        src={src}
        alt={name ?? ""}
        width={size}
        height={size}
        unoptimized
        className="shrink-0 rounded-full object-cover"
        style={style}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      style={style}
      className={[
        "flex shrink-0 items-center justify-center rounded-full text-sm font-bold",
        anonymous ? "bg-[#e8eef5] text-[#7b8794]" : "bg-[#f0ecff] text-[#6c4cff]",
      ].join(" ")}
    >
      {anonymous && !name ? "AD" : initials(name)}
    </span>
  );
}
