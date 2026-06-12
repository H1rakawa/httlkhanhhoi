import Image from "next/image";

export default function ContactHero() {
  return (
    <section className="relative z-10 isolate flex min-h-[620px] items-center overflow-hidden bg-[#dce4e5] px-5 pb-12 pt-28 md:min-h-[720px] md:pt-32">
      <Image
        src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2400&q=90"
        alt="Mặt hồ yên bình giữa thiên nhiên"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/10" />
      <div className="liquid-glass relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-6 py-12 text-center text-[#111113] md:px-14 md:py-16">
        <p className="text-sm font-semibold text-[#0066cc]">
          Kết nối với HTTL. Khánh Hội
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-normal md:text-6xl">
          Chúng tôi luôn sẵn lòng lắng nghe bạn.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#5f6268] md:text-base">
          Gửi lời nhắn, tìm đường đến hội thánh, hoặc kết nối nhanh với đội ngũ
          đồng hành của chúng tôi.
        </p>
      </div>
    </section>
  );
}
