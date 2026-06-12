"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

export default function HeroBanner() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.2]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 90]);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 isolate flex min-h-[620px] items-center overflow-hidden bg-[#dce4e5] px-5 pb-12 pt-28 md:min-h-[720px] md:pt-32"
    >
      <motion.div
        className="absolute -inset-[12%]"
        style={{ y: backgroundY, scale: backgroundScale }}
      >
        <Image
          src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2400&q=90"
          alt="Hồ nước bình yên giữa núi rừng"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-black/10" />
      <motion.div
        className="liquid-glass relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-10 text-center text-[#111113] md:px-12 md:py-12"
        style={{ y: contentY }}
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.86, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-sm font-semibold text-[#0066cc]">HTTL. Khánh Hội</p>
        <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-[1.05] tracking-normal md:text-6xl">
          Nơi Bình Yên
          <span className="block">Tìm Thấy Ân Điển</span>
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-[#6e6e73] md:text-base">
          Một không gian của sự kết nối, tâm linh và tình yêu thương.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#schedule"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#0066cc] px-6 text-sm font-semibold text-white no-underline shadow-[0_8px_18px_rgba(0,102,204,0.24)] transition-transform hover:-translate-y-0.5"
          >
            Tham gia cùng chúng tôi
          </a>
          <a
            href="/about"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium text-[#0066cc] no-underline transition-colors hover:bg-[#f0f6ff]"
          >
            Tìm hiểu thêm
            <span aria-hidden="true">›</span>
          </a>
        </div>
      </motion.div>
    </section>
  );
}
