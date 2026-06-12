"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

export default function HomeParallaxBackdrop() {
  const { scrollYProgress } = useScroll();
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.2]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#e7eef4]">
      <motion.div
        className="absolute -inset-[20%]"
        style={{ y: imageY, scale: imageScale }}
      >
        <Image
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2400&q=85"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-44"
        />
      </motion.div>
      <div className="absolute inset-0 bg-white/48 backdrop-blur-[1px]" />
    </div>
  );
}
