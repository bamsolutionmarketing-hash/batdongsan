"use client";

import { useEffect, useRef, useState } from "react";

// Lightweight, dependency-free animated SVG charts for the finance result cards.
// All use viewBox so they scale fluidly on mobile. Animations are mount-driven
// (settle to final state) so html-to-image captures them correctly after a beat.

// ── Count-up number ─────────────────────────────────────────────────────────
export function CountUp({
  value,
  format,
  durationMs = 700,
  className,
}: {
  value: number;
  format: (n: number) => string;
  durationMs?: number;
  className?: string;
}) {
  const [n, setN] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(from + (value - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);
  return <span className={className}>{format(n)}</span>;
}

// ── Donut (gốc vs lãi) ───────────────────────────────────────────────────────
export interface DonutSeg {
  value: number;
  color: string;
  label: string;
}
export function Donut({ segments, size = 168, thickness = 22, centerTop, centerSub }: {
  segments: DonutSeg[];
  size?: number;
  thickness?: number;
  centerTop?: string;
  centerSub?: string;
}) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const frac = s.value / total;
          const len = on ? frac * C : 0;
          const offset = -acc * C;
          acc += frac;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeLinecap="butt"
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transition: `stroke-dasharray 900ms cubic-bezier(.22,1,.36,1) ${i * 120}ms` }}
            />
          );
        })}
      </svg>
      <div className="absolute flex flex-col items-center text-center">
        {centerTop && <span className="text-lg font-bold leading-tight text-foreground">{centerTop}</span>}
        {centerSub && <span className="text-[11px] text-muted-foreground">{centerSub}</span>}
      </div>
    </div>
  );
}

// ── Balance-over-time area + payment line ────────────────────────────────────
export interface BalancePoint {
  year: number;
  balance: number;
  payment: number;
}
export function BalanceChart({ points, promoYear }: { points: BalancePoint[]; promoYear?: number | null }) {
  const [on, setOn] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const W = 320, H = 150, PAD = 6;
  if (points.length < 2) return null;
  const maxBal = Math.max(...points.map((p) => p.balance)) || 1;
  const maxPay = Math.max(...points.map((p) => p.payment)) || 1;
  const x = (i: number) => PAD + (i / (points.length - 1)) * (W - 2 * PAD);
  const yBal = (v: number) => H - PAD - (v / maxBal) * (H - 2 * PAD);
  const yPay = (v: number) => H - PAD - (v / maxPay) * (H - 2 * PAD - 30);
  const areaPath =
    `M ${x(0)} ${yBal(points[0].balance)} ` +
    points.map((p, i) => `L ${x(i)} ${yBal(p.balance)}`).join(" ") +
    ` L ${x(points.length - 1)} ${H - PAD} L ${x(0)} ${H - PAD} Z`;
  const balLine = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${yBal(p.balance)}`).join(" ");
  const payLine = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${yPay(p.payment)}`).join(" ");
  const dash = pathRef.current?.getTotalLength?.() ?? 600;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <defs>
        <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </linearGradient>
      </defs>
      {promoYear != null && promoYear > 0 && (
        <line x1={x(promoYear)} y1={PAD} x2={x(promoYear)} y2={H - PAD} stroke="#f0883e" strokeWidth="1.5" strokeDasharray="4 3" />
      )}
      <path d={areaPath} fill="url(#balGrad)" opacity={on ? 1 : 0} style={{ transition: "opacity 900ms ease 200ms" }} />
      <path
        ref={pathRef}
        d={balLine}
        fill="none"
        stroke="#38bdf8"
        strokeWidth="2.5"
        strokeDasharray={dash}
        strokeDashoffset={on ? 0 : dash}
        style={{ transition: "stroke-dashoffset 1100ms ease" }}
      />
      <path d={payLine} fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3 3" opacity={on ? 0.95 : 0} style={{ transition: "opacity 700ms ease 600ms" }} />
    </svg>
  );
}

// ── Gauge (áp lực trả nợ / khả năng) ─────────────────────────────────────────
export function Gauge({ percent, label }: { percent: number; label?: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const p = Math.max(0, Math.min(100, percent));
  const W = 220, H = 124, cx = W / 2, cy = 110, r = 90;
  const polar = (deg: number) => {
    const rad = (Math.PI * (180 - deg)) / 180;
    return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)];
  };
  const arc = (from: number, to: number) => {
    const [x1, y1] = polar(from);
    const [x2, y2] = polar(to);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  };
  const color = p <= 40 ? "#3fb950" : p <= 55 ? "#fbbf24" : "#f85149";
  const needleDeg = on ? (p / 100) * 180 : 0;
  const [nx, ny] = polar(needleDeg);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      <path d={arc(0, 72)} fill="none" stroke="#3fb950" strokeWidth="12" strokeLinecap="round" opacity="0.35" />
      <path d={arc(72, 99)} fill="none" stroke="#fbbf24" strokeWidth="12" strokeLinecap="round" opacity="0.35" />
      <path d={arc(99, 180)} fill="none" stroke="#f85149" strokeWidth="12" strokeLinecap="round" opacity="0.35" />
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth="3.5" strokeLinecap="round" style={{ transition: "all 1000ms cubic-bezier(.22,1,.36,1)" }} />
      <circle cx={cx} cy={cy} r="6" fill={color} />
      <text x={cx} y={cy - 28} textAnchor="middle" fontSize="26" fontWeight="800" fill={color}>{Math.round(p)}%</text>
      {label && <text x={cx} y={cy - 8} textAnchor="middle" fontSize="11" fill="#94a3b8">{label}</text>}
    </svg>
  );
}

// ── Horizontal bars (đợt thanh toán / dòng tiền) ─────────────────────────────
export interface BarItem {
  label: string;
  value: number;
  display: string;
  color?: string;
}
export function MiniBars({ items }: { items: BarItem[] }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const max = Math.max(...items.map((i) => Math.abs(i.value))) || 1;
  return (
    <div className="flex flex-col gap-2">
      {items.map((it, i) => (
        <div key={i} className="flex flex-col gap-0.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{it.label}</span>
            <span className="font-medium text-foreground">{it.display}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{
                width: on ? `${(Math.abs(it.value) / max) * 100}%` : "0%",
                background: it.color ?? "#38bdf8",
                transition: `width 800ms cubic-bezier(.22,1,.36,1) ${i * 80}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
