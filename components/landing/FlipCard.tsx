"use client";

import { useState } from "react";

// 3D flip card (genially-style): hover to flip on desktop, tap on mobile,
// Enter/Space for keyboard. Front/back are full-bleed faces.
export function FlipCard({
  front, back, className = "", height = "h-64",
}: {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
  height?: string;
}) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      onClick={() => setFlipped((f) => !f)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlipped((f) => !f); }
      }}
      className={`flip-card block w-full cursor-pointer ${height} ${flipped ? "is-flipped" : ""} ${className}`}
    >
      <div className="flip-inner h-full w-full">
        <div className="flip-face h-full w-full">{front}</div>
        <div className="flip-face flip-back h-full w-full">{back}</div>
      </div>
    </div>
  );
}
