"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Premium scroll feel: Lenis inertial smooth-scroll synced to GSAP ScrollTrigger,
// plus data-driven scroll effects:
//   [data-parallax="N"]  → element drifts up by N% as it passes (depth)
//   [data-reveal]         → fades/slides up when it enters the viewport
//   [data-reveal-stagger] → its direct children reveal in sequence
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const depth = Number(el.dataset.parallax) || 16;
        gsap.fromTo(el, { yPercent: depth * 0.5 }, {
          yPercent: -depth, ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          opacity: 0, y: 56, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });
      gsap.utils.toArray<HTMLElement>("[data-reveal-stagger]").forEach((el) => {
        gsap.from(Array.from(el.children), {
          opacity: 0, y: 48, duration: 0.8, ease: "power3.out", stagger: 0.12,
          scrollTrigger: { trigger: el, start: "top 80%", once: true },
        });
      });
    });

    const id = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => { clearTimeout(id); ctx.revert(); gsap.ticker.remove(tick); lenis.destroy(); };
  }, []);

  return <>{children}</>;
}
