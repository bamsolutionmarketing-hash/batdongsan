"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/landing/useScroll";

// Real estate photos (Unsplash CDN). z = depth → stronger parallax on tilt.
const W = "auto=format&fit=crop&q=80&w=700";
const CARDS = [
  { src: `https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?${W}`, cls: "left-0 top-[10%] h-[80%] w-[56%]", z: 0, rot: "-1.5deg" },
  { src: `https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?${W}`, cls: "right-0 top-0 h-[44%] w-[42%]", z: 60, rot: "2deg" },
  { src: `https://images.unsplash.com/photo-1512917774080-9991f1c4c750?${W}`, cls: "right-[4%] bottom-[2%] h-[42%] w-[40%]", z: 40, rot: "-2deg" },
];

export function HeroInteractive() {
  const reduced = usePrefersReducedMotion();
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || reduced || window.matchMedia("(pointer: coarse)").matches) return;
    let raf = 0, tx = 0, ty = 0, x = 0, y = 0;
    const loop = () => {
      raf = 0;
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      scene.style.transform = `rotateX(${-y * 4}deg) rotateY(${x * 5}deg)`;
      if (Math.abs(tx - x) > 0.001 || Math.abs(ty - y) > 0.001) raf = requestAnimationFrame(loop);
    };
    const onMove = (e: MouseEvent) => {
      const r = scene.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) / r.width;
      ty = (e.clientY - (r.top + r.height / 2)) / r.height;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => { window.removeEventListener("mousemove", onMove); if (raf) cancelAnimationFrame(raf); };
  }, [reduced]);

  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-md select-none [perspective:1300px]">
      <div className="pointer-events-none absolute inset-6 rounded-[2rem] bg-foreground/[0.05] blur-3xl" />
      <div
        ref={sceneRef}
        className="absolute inset-0 transition-transform duration-300 ease-out [transform-style:preserve-3d] will-change-transform"
      >
        {CARDS.map((c, i) => (
          <figure
            key={i}
            className={`absolute overflow-hidden rounded-2xl border border-border bg-muted shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)] ${c.cls}`}
            style={{ transform: `translateZ(${c.z}px) rotate(${c.rot})` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.src} alt="Dự án bất động sản" loading="eager" className="h-full w-full object-cover" />
          </figure>
        ))}

        {/* Floating product chips */}
        <div className="absolute left-[2%] top-[6%] flex items-center gap-1.5 rounded-full border border-border bg-background/90 px-2.5 py-1 text-[11px] font-medium text-foreground shadow-card backdrop-blur" style={{ transform: "translateZ(110px)" }}>
          <span className="h-2 w-2 rounded-full bg-brand" /> Vành đai 3 · 30/6
        </div>
        <div className="absolute bottom-[2%] left-[20%] flex items-center gap-1.5 rounded-full border border-border bg-background/90 px-2.5 py-1 text-[11px] font-medium text-foreground shadow-card backdrop-blur" style={{ transform: "translateZ(95px)" }}>
          <span>✓</span> Green Mark · Keppel
        </div>
      </div>
    </div>
  );
}
