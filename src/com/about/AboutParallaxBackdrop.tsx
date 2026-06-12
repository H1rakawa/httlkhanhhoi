"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

export default function AboutParallaxBackdrop() {
  const { scrollYProgress } = useScroll();
  const imageY = useTransform(scrollYProgress, [0, 1], ["-4%", "20%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.22]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#dfe8ef]">
      <motion.div
        className="absolute -inset-[22%]"
        style={{ y: imageY, scale: imageScale }}
      >
        <Image
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2400&q=88"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-42"
        />
      </motion.div>
      <div className="absolute inset-0 bg-white/52 backdrop-blur-[2px]" />
    </div>
  );
}
