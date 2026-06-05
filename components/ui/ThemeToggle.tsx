"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

// Sun/moon theme toggle (light / dark). Renders a stable placeholder until
// mounted to avoid hydration mismatch.
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      aria-label="Đổi giao diện sáng/tối"
      onClick={() => setTheme(dark ? "light" : "dark")}
      className={`grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground ${className}`}
    >
      {mounted ? (dark ? "☀️" : "🌙") : <span className="h-4 w-4" />}
    </button>
  );
}
