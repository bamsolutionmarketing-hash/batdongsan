"use client";

import { useCountUp } from "@/lib/landing/useScroll";

// Animated stat that counts up when scrolled into view.
export function Counter({ to, label, suffix = "" }: { to: number; label: string; suffix?: string }) {
  const { ref, val } = useCountUp(to);
  return (
    <div>
      <div className="text-4xl font-extrabold leading-none tracking-tight text-brand sm:text-5xl">
        <span ref={ref}>{val.toLocaleString("vi-VN")}</span>{suffix}
      </div>
      <div className="mt-2 text-sm font-medium text-foreground">{label}</div>
    </div>
  );
}
