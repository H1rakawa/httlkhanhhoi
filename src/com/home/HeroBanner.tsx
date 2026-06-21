import Image from "next/image";

export default function HeroBanner() {
  return (
    <section className="relative z-10 isolate flex min-h-155 items-center overflow-hidden bg-[#dce4e5] px-5 pb-12 pt-28 md:min-h-180 md:pt-32">
      <Image
        src="/images/parallax-background.png"
        alt="Bữa tiệc cưới Ca-na"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-88"
      />
      <div className="absolute inset-0 bg-white/24 backdrop-blur-[1px]" />
      <div className="liquid-glass relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-6 py-12 text-center text-[#111113] md:px-14 md:py-16">
        <p className="text-sm font-semibold text-[#0066cc]">HTTL. Khánh Hội</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-[1.05] tracking-normal sm:text-4xl md:text-6xl">
          Nơi Bày Tỏ
          <span className="block">Tình Yêu Thiên Thượng</span>
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-[#6e6e73] md:text-base">
          Mọi người đều được yêu và được bày tỏ tình yêu thương.
        </p>
        <div className="mt-7 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <a
            href="#schedule"
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#0066cc] px-6 text-sm font-semibold text-white no-underline shadow-[0_8px_18px_rgba(0,102,204,0.24)] sm:w-auto"
          >
            Tham gia cùng chúng tôi
          </a>
          <a
            href="/about"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-medium text-[#0066cc] no-underline sm:w-auto"
          >
            Tìm hiểu thêm <span aria-hidden="true">›</span>
          </a>
        </div>
      </div>
    </section>
  );
}
