import { Button } from "@heroui/react";
import { MotionSection } from "@/com/shared/MotionSection";

export default function AboutSummary() {
  return (
    <MotionSection
      className="liquid-glass mx-auto w-full max-w-7xl px-6 py-10 text-center md:px-14 md:py-12"
      id="about-summary"
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl font-semibold tracking-normal text-[#1d1d1f]">
          Về HTTL. Khánh Hội
        </h2>
        <p className="mt-5 text-sm leading-7 text-[#6e6e73] md:text-base">
          HTTL. Khánh Hội không chỉ là một ngôi nhà thờ, mà là một cộng đồng nơi
          tâm hồn được đón nhận. Chúng tôi tin vào sức mạnh của ân điển để chữa
          lành, biến đổi và kết nối con người với nhau trong tình yêu thương vô
          điều kiện.
        </p>
        <div className="mt-4 flex justify-center">
          <Button
            variant="ghost"
            className="rounded-full text-[#0066cc]"
          >
            Tìm hiểu về lịch sử của chúng tôi
            <span aria-hidden="true">›</span>
          </Button>
        </div>
      </div>
    </MotionSection>
  );
}
