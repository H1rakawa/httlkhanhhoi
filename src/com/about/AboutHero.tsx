import Image from "next/image";

export default function AboutHero() {
  return (
    <section className="relative z-10 isolate flex min-h-[620px] items-center overflow-hidden bg-white px-5 pb-16 pt-28 text-[#1d1d1f]">
      <Image
        src="https://images.unsplash.com/photo-1476231682828-37e571bc172f?auto=format&fit=crop&w=2400&q=85"
        alt="Con đường bình an giữa rừng cây"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-68"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.46),rgba(244,247,251,0.54)_70%,rgba(244,247,251,0.72)_100%)]" />
      <div className="liquid-glass relative z-10 mx-auto w-full max-w-7xl px-7 py-12 text-center md:px-14 md:py-16">
        <p className="mx-auto w-fit rounded-full border border-white bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#0066cc] shadow-sm">
          Thành đường bình an
        </p>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-[#1d1d1f] md:text-6xl">
          Về HTTL. Khánh Hội
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#59616d] md:text-base">
          Nơi đức tin tìm thấy bình yên và cộng đồng tìm thấy mục đích sống cao đẹp.
        </p>
      </div>
    </section>
  );
}
