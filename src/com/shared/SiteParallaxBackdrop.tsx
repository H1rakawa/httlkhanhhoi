"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type SiteParallaxBackdropProps = {
  imageOpacity?: string;
  overlayClassName?: string;
  priority?: boolean;
  strength?: number;
};

export default function SiteParallaxBackdrop({
  imageOpacity = "opacity-48",
  overlayClassName = "bg-white/50 backdrop-blur-[2px]",
  priority = false,
  strength = 0.06,
}: SiteParallaxBackdropProps) {
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
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#e9edf1]">
      <div
        className="absolute -inset-x-10 -inset-y-20"
        style={{
          transform: `translate3d(0, ${scrollY * -strength}px, 0) scale(1.08)`,
        }}
      >
        <Image
          src="/images/parallax-background.png"
          alt=""
          fill
          priority={priority}
          sizes="100vw"
          className={`object-cover object-center ${imageOpacity}`}
        />
      </div>
      <div className={`absolute inset-0 ${overlayClassName}`} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(246,248,250,0.58))]" />
    </div>
  );
}
