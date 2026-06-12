"use client";

import { motion } from "framer-motion";

export default function ContactHero() {
  return (
    <section className="relative isolate flex min-h-[440px] items-center overflow-hidden bg-black px-5 pt-14 text-white">
      <div className="about-hero-image absolute inset-0 opacity-72" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.2),rgba(0,0,0,0.84))]" />
      <motion.div
        className="relative z-10 mx-auto max-w-3xl text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-sm font-medium text-white/72">
          Kết nối với HTTL. Khánh Hội
        </p>
        <h1 className="mt-5 text-5xl font-semibold leading-tight tracking-normal md:text-6xl">
          Chúng tôi luôn sẵn lòng lắng nghe bạn.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/74">
          Gửi lời nhắn, tìm đường đến hội thánh, hoặc kết nối nhanh với đội ngũ
          đồng hành của chúng tôi.
        </p>
      </motion.div>
    </section>
  );
}
