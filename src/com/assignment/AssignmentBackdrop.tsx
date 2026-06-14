"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function AssignmentBackdrop() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let frameId = 0;

    const updatePosition = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => setScrollY(window.scrollY));
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, { passive: true });
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", updatePosition);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#dfe8ef]">
      <div
        className="absolute -inset-x-8 -inset-y-16"
        style={{ transform: `translate3d(0, ${scrollY * -0.055}px, 0) scale(1.08)` }}
      >
        <Image
          src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2400&q=88"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-58"
        />
      </div>
      <div
        className="absolute inset-x-0 bottom-[-15%] h-[65%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.52),rgba(163,190,214,0.18)_45%,transparent_70%)]"
        style={{ transform: `translate3d(0, ${scrollY * -0.12}px, 0)` }}
      />
      <div
        className="absolute -left-[12%] top-[28%] h-[42vw] w-[42vw] rounded-full bg-[#dbe9f5]/32 blur-[90px]"
        style={{ transform: `translate3d(0, ${scrollY * -0.18}px, 0)` }}
      />
      <div className="absolute inset-0 bg-white/36 backdrop-blur-[1px]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(235,244,250,0.08),rgba(239,244,248,0.46))]" />
    </div>
  );
}
