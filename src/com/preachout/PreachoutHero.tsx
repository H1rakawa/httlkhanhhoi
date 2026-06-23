import Link from "next/link";

export default function PreachoutHero() {
  return (
    <section className="relative z-10 px-5 pb-14 pt-28 md:pb-20">
      <div className="liquid-glass mx-auto flex min-h-[420px] max-w-7xl items-center justify-center px-8 py-16 text-center md:px-16">
        <div className="mx-auto max-w-3xl">
          <p className="mx-auto w-fit rounded-full border border-white/90 bg-white/72 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#1d1d1f] shadow-sm">
            Sứ mệnh cộng đồng
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-normal md:text-6xl">
            Lan Tỏa Yêu Thương & Hy Vọng
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#626a75] md:text-base">
            Chung tay xây dựng một cộng đồng tâm linh vững mạnh, nơi sự tử tế
            và lòng trắc ẩn là cầu nối giữa mọi trái tim.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="#events"
              className="inline-flex h-12 items-center justify-center rounded-[14px] bg-[#111113] px-8 text-sm font-semibold text-white no-underline shadow-[0_14px_26px_rgba(0,0,0,0.2)]"
            >
              Tham Gia Ngay
            </Link>
            <Link
              href="#resources"
              className="inline-flex h-12 items-center justify-center rounded-[14px] border border-white/90 bg-white/62 px-8 text-sm font-semibold text-[#424245] no-underline"
            >
              Tìm Hiểu Thêm
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
