import { PrayerPrivacy } from "@/com/pray/prayData";

export default function PrivacyIndicator({ privacy }: { privacy: PrayerPrivacy }) {
  const isPrivate = privacy === "Riêng tư";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold",
        isPrivate
          ? "border-[#ff9f0a]/30 bg-[#fff4df] text-[#9a5f00]"
          : "border-[#6c4cff]/22 bg-[#f0ecff] text-[#6c4cff]",
      ].join(" ")}
    >
      {privacy}
    </span>
  );
}
