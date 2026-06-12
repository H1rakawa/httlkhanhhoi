import { MotionSection } from "@/com/shared/MotionSection";

export default function ContactMap() {
  return (
    <MotionSection className="bg-[#f5f5f7] px-5 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:items-end">
          <div>
            <p className="text-sm font-medium text-[#0066cc]">Vị trí hội thánh</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-[#1d1d1f]">
              Ghé thăm HTTL. Khánh Hội
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#6e6e73]">
              Hội thánh nằm tại trung tâm thành phố, thuận tiện cho các buổi
              nhóm, chương trình cộng đồng và những cuộc gặp gỡ cần sự riêng tư.
            </p>
          </div>
          <div className="map-image min-h-[360px] rounded-[18px] shadow-sm" />
        </div>
      </div>
    </MotionSection>
  );
}
