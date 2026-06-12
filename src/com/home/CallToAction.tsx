import { MotionSection } from "@/com/shared/MotionSection";

export default function CallToAction() {
  return (
    <MotionSection className="liquid-glass mx-auto w-full max-w-7xl px-6 py-10 text-[#1d1d1f] md:px-12 md:py-12">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-semibold tracking-normal">
          Gửi Lời Cầu Thay
        </h2>
        <p className="mt-4 text-lg leading-8 text-[#6e6e73] md:text-xl">
          Hãy để chúng tôi cùng hiệp nguyện với bạn trong mọi hoàn cảnh.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-4">
          <a
            href="#contact"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#0066cc] px-7 text-sm font-semibold text-white no-underline shadow-[0_8px_18px_rgba(0,102,204,0.22)]"
          >
            Gửi yêu cầu ngay
          </a>
          <a
            href="#contact"
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/90 bg-white/42 px-7 text-sm font-semibold text-[#1d1d1f] no-underline shadow-[0_8px_18px_rgba(31,48,70,0.1)] backdrop-blur-xl"
          >
            Đăng ký nhận tin
          </a>
        </div>
      </div>
    </MotionSection>
  );
}
