"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/landing/useScroll";

// A soft gold glow that trails the cursor across the page (desktop only).
export function CursorGlow() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduced || window.matchMedia("(pointer: coarse)").matches) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0, tx = 0, ty = 0, x = 0, y = 0;
    const loop = () => {
      raf = 0;
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      el.style.transform = `translate(${x}px, ${y}px)`;
      if (Math.abs(tx - x) > 0.4 || Math.abs(ty - y) > 0.4) raf = requestAnimationFrame(loop);
    };
    const move = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(loop); };
    window.addEventListener("mousemove", move, { passive: true });
    return () => { window.removeEventListener("mousemove", move); if (raf) cancelAnimationFrame(raf); };
  }, [reduced]);
  if (reduced) return null;
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed -left-48 -top-48 z-[1] hidden h-96 w-96 rounded-full mix-blend-screen sm:block"
      style={{ background: "radial-gradient(circle, rgba(251,191,36,0.10), transparent 60%)", willChange: "transform" }}
    />
  );
}

// Wraps content with a gold spotlight that follows the cursor on hover.
export function Spotlight({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div ref={ref} onMouseMove={onMove} className={`group/spot relative ${className}`}>
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{ background: "radial-gradient(240px circle at var(--mx) var(--my), rgba(251,191,36,0.14), transparent 60%)" }}
      />
      {children}
    </div>
  );
}

// Button/element that gently leans toward the cursor (magnetic effect).
export function Magnetic({ children, className = "", strength = 0.25 }: { children: React.ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };
  const reset = () => { if (ref.current) ref.current.style.transform = "translate(0,0)"; };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={reset} className={`inline-block transition-transform duration-300 ease-out ${className}`}>
      {children}
    </div>
  );
}
