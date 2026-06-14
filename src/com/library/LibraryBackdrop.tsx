"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function LibraryBackdrop() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const update = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => setScrollY(window.scrollY));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#e5edf5]">
      <div
        className="absolute -inset-20"
        style={{ transform: `translate3d(0, ${scrollY * -0.045}px, 0) scale(1.08)` }}
      >
        <Image
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2400&q=88"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-34"
        />
      </div>
      <div
        className="absolute -right-[18vw] top-[8vh] h-[48vw] w-[48vw] rounded-full bg-[#b9d9f3]/32 blur-[95px]"
        style={{ transform: `translate3d(0, ${scrollY * -0.14}px, 0)` }}
      />
      <div
        className="absolute -left-[20vw] top-[48vh] h-[52vw] w-[52vw] rounded-full bg-white/46 blur-[110px]"
        style={{ transform: `translate3d(0, ${scrollY * -0.2}px, 0)` }}
      />
      <div className="absolute inset-0 bg-white/54 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(247,250,255,0.28),rgba(223,235,245,0.55))]" />
    </div>
  );
}
