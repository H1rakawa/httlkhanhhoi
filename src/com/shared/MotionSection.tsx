"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type ScrollDirection = "up" | "down";

export const directionalFade = {
  hidden: (direction: ScrollDirection) => ({
    opacity: 0,
    y: direction === "down" ? 42 : -42,
  }),
  show: { opacity: 1, y: 0 },
};

export const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.14,
    },
  },
};

function useScrollDirection() {
  const lastScrollY = useRef(0);
  const [direction, setDirection] = useState<ScrollDirection>("down");

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const updateDirection = () => {
      const nextScrollY = window.scrollY;

      if (Math.abs(nextScrollY - lastScrollY.current) < 4) return;

      setDirection(nextScrollY > lastScrollY.current ? "down" : "up");
      lastScrollY.current = nextScrollY;
    };

    window.addEventListener("scroll", updateDirection, { passive: true });

    return () => window.removeEventListener("scroll", updateDirection);
  }, []);

  return direction;
}

function isElementInViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect();

  return rect.bottom > 0 && rect.top < window.innerHeight;
}

export function MotionSection({
  children,
  className,
  id,
}: React.PropsWithChildren<{ className?: string; id?: string }>) {
  const [isVisible, setIsVisible] = useState(true);
  const direction = useScrollDirection();
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const element = elementRef.current;

      if (element && !isElementInViewport(element)) {
        setIsVisible(false);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <motion.section
      ref={elementRef}
      id={id}
      className={className}
      initial={false}
      custom={direction}
      animate={isVisible ? "show" : "hidden"}
      onViewportEnter={() => setIsVisible(true)}
      onViewportLeave={() => setIsVisible(false)}
      viewport={{ once: false, amount: 0.22, margin: "-8% 0px -8% 0px" }}
      variants={directionalFade}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
}

export function MotionGroup({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <motion.div className={className} variants={stagger}>
      {children}
    </motion.div>
  );
}

export function MotionItem({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  const [isVisible, setIsVisible] = useState(true);
  const direction = useScrollDirection();
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const element = elementRef.current;

      if (element && !isElementInViewport(element)) {
        setIsVisible(false);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <motion.div
      ref={elementRef}
      className={className}
      initial={false}
      custom={direction}
      animate={isVisible ? "show" : "hidden"}
      onViewportEnter={() => setIsVisible(true)}
      onViewportLeave={() => setIsVisible(false)}
      viewport={{ once: false, amount: 0.18 }}
      variants={directionalFade}
      transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
