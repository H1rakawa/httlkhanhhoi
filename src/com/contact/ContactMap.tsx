import Image from "next/image";
import { MotionSection } from "@/com/shared/MotionSection";

export default function ContactMap() {
  return (
    <MotionSection className="liquid-glass mx-auto w-full max-w-7xl p-5 md:p-10">
      <div className="grid gap-6 md:grid-cols-[0.85fr_1.15fr] md:items-stretch">
        <div className="liquid-readable flex flex-col justify-center p-6 md:p-8">
          <p className="text-sm font-medium text-[#0066cc]">Vị trí hội thánh</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal text-[#1d1d1f]">
            Ghé thăm HTTL. Khánh Hội
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#6e6e73]">
            Hội thánh nằm tại trung tâm thành phố, thuận tiện cho các buổi nhóm,
            chương trình cộng đồng và những cuộc gặp gỡ cần sự riêng tư.
          </p>
        </div>
        <div className="liquid-readable min-h-[360px] p-3">
          <div className="relative h-full min-h-[336px] overflow-hidden rounded-[12px]">
            <Image
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=88"
              alt="Bản đồ vị trí HTTL. Khánh Hội"
              fill
              sizes="(min-width: 768px) 55vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </MotionSection>
  );
}
