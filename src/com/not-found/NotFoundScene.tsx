import Link from "next/link";
import SiteParallaxBackdrop from "@/com/shared/SiteParallaxBackdrop";

function CompassOffIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-14 w-14"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="17" />
      <path d="M15.5 15.5 32.5 32.5" />
      <path d="m18 31 4.4-12.6L35 14l-4.4 12.6L18 31Z" />
      <path d="M7 7l34 34" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}

export default function NotFoundScene() {
  return (
    <main className="relative min-h-screen overflow-clip bg-[#f2f4f8] text-[#111827]">
      <SiteParallaxBackdrop
        priority
        imageOpacity="opacity-52"
        overlayClassName="bg-[#f6f7fb]/72 backdrop-blur-[1.5px]"
        strength={0.045}
      />

      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_78%_16%,rgba(255,246,219,0.58),transparent_26%),radial-gradient(circle_at_18%_78%,rgba(208,221,255,0.45),transparent_25%)]" />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-5 py-20">
        <div className="text-center">
          <div className="liquid-glass mx-auto w-full max-w-[560px] rounded-[30px] px-8 py-12 shadow-[0_34px_110px_rgba(31,48,70,0.16)] md:px-14">
            <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-white/42 text-[#9a7628] shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_18px_40px_rgba(31,48,70,0.1)]">
              <CompassOffIcon />
            </div>

            <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-[#15171d] md:text-3xl">
              Trang không tìm thấy
            </h1>
            <p className="mx-auto mt-5 max-w-[360px] text-sm font-semibold leading-7 text-[#66717e]">
              Có lẽ bạn đã lạc lối một chút trên hành trình tâm linh này.
              Hãy để chúng tôi dẫn bạn trở lại nơi bình yên.
            </p>

            <div className="pointer-events-none absolute inset-x-0 top-[54%] -z-10 select-none text-[92px] font-black leading-none tracking-[-0.08em] text-[#111827]/[0.055] md:text-[118px]">
              404
            </div>

            <Link
              href="/"
              className="mt-9 inline-flex h-12 items-center justify-center gap-3 rounded-[14px] border border-white/72 bg-white/60 px-6 text-sm font-extrabold text-[#303943] no-underline shadow-[0_12px_34px_rgba(31,48,70,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/82"
            >
              <HomeIcon />
              Trở về Trang chủ
            </Link>
          </div>

          <p className="mt-7 text-xs font-bold tracking-[0.16em] text-[#7a8491]">
            Lỗi định danh: ERROR_WAYFINDING_404
          </p>
        </div>
      </section>
    </main>
  );
}
