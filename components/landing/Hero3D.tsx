"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/landing/useScroll";

// Floating knowledge nodes (z = depth → parallax strength on tilt/scroll).
const NODES = [
  { label: "Vành đai 3", x: 14, y: 20, z: 120, c: "#38bdf8" },
  { label: "Sân bay Long Thành", x: 62, y: 12, z: 170, c: "#34d399" },
  { label: "Metro số 6", x: 74, y: 52, z: 80, c: "#a78bfa" },
  { label: "Green Mark", x: 18, y: 62, z: 130, c: "#fbbf24" },
  { label: "Keppel Land", x: 46, y: 40, z: 210, c: "#f472b6" },
];
const EDGES: [number, number][] = [[4, 0], [4, 1], [4, 2], [4, 3]];

// 3D real-estate scene: skyline + floating knowledge nodes. The whole scene
// tilts with the mouse and drifts with scroll → it "follows" you down the hero.
export function Hero3D() {
  const reduced = usePrefersReducedMotion();
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || reduced) return;
    let raf = 0, mx = 0, my = 0, sy = 0;
    const apply = () => {
      raf = 0;
      const rotY = mx * 12;
      const rotX = -my * 9 + 6;
      const lift = sy * -0.05; // scroll drift
      scene.style.transform = `translateY(${lift}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(apply); };
    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
      queue();
    };
    const onScroll = () => { sy = window.scrollY; queue(); };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    apply();
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-md select-none [perspective:1200px]">
      <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-sky-500/20 via-transparent to-violet-500/15 blur-3xl" />
      <div
        ref={sceneRef}
        className="absolute inset-0 transition-transform duration-200 ease-out will-change-transform [transform-style:preserve-3d]"
        style={{ transform: "rotateX(6deg)" }}
      >
        {/* Skyline silhouette (far layer) */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" style={{ transform: "translateZ(-60px)" }}>
          <defs>
            <linearGradient id="bld" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1e293b" />
              <stop offset="1" stopColor="#0b1220" />
            </linearGradient>
          </defs>
          {[
            [6, 64, 10, 34], [18, 52, 9, 46], [28, 70, 8, 28], [38, 44, 11, 54],
            [51, 58, 9, 40], [62, 38, 12, 60], [76, 56, 9, 42], [87, 66, 8, 32],
          ].map(([x, y, w, h], i) => (
            <g key={i}>
              <rect x={x} y={y} width={w} height={h} fill="url(#bld)" rx={0.6} />
              {Array.from({ length: Math.floor(h / 8) }).map((_, r) => (
                <rect key={r} x={x + 1.5} y={y + 3 + r * 7} width={w - 3} height={1.4} fill="rgba(125,211,252,0.18)" />
              ))}
            </g>
          ))}
        </svg>

        {/* Edges between nodes */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible" style={{ transform: "translateZ(40px)" }}>
          {EDGES.map(([a, b], i) => (
            <line key={i} x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y}
              stroke="rgba(148,163,184,0.35)" strokeWidth={0.4} strokeDasharray="1.5 1.5" />
          ))}
        </svg>

        {/* Floating nodes */}
        {NODES.map((n, i) => (
          <div key={i} className="absolute" style={{ left: `${n.x}%`, top: `${n.y}%`, transform: `translate(-50%,-50%) translateZ(${n.z}px)` }}>
            <div
              className="will-change-transform"
              style={{ animation: reduced ? undefined : `lp-float ${4 + (i % 3)}s ease-in-out ${i * 0.45}s infinite` }}
            >
              <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-700 bg-slate-900/90 px-2.5 py-1 text-[11px] font-medium text-slate-200 shadow-xl shadow-slate-950/60 backdrop-blur">
                <span className="relative grid h-2.5 w-2.5 place-items-center">
                  <span className="absolute h-2.5 w-2.5 rounded-full" style={{ background: n.c, boxShadow: `0 0 12px ${n.c}` }} />
                </span>
                {n.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
