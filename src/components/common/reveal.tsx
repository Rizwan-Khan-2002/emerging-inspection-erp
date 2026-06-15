"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/** GSAP staggered fade-up reveal of direct children on mount. */
export function Reveal({
  children, className, stagger = 0.06, y = 18,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = Array.from(el.children);
    const ctx = gsap.context(() => {
      gsap.from(targets, {
        y, opacity: 0, duration: 0.55, ease: "power3.out", stagger,
      });
    }, el);
    return () => ctx.revert();
  }, [stagger, y]);

  return <div ref={ref} className={className}>{children}</div>;
}
