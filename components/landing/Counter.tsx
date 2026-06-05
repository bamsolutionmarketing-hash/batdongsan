"use client";

import { useCountUp } from "@/lib/landing/useScroll";

// Animated stat that counts up when scrolled into view.
export function Counter({ to, label, suffix = "" }: { to: number; label: string; suffix?: string }) {
  const { ref, val } = useCountUp(to);
  return (
    <div>
      <div className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        <span ref={ref}>{val.toLocaleString("vi-VN")}</span>{suffix}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
