"use client";

import { useEffect, useRef, useState } from "react";

export interface Feature {
  icon: string;
  title: string;
  desc: string;
  back: string;
}

const EB = "text-[11px] uppercase tracking-widest text-muted-foreground";

// One distinct accent colour per feature (drives glow, ring, bar, panel shadow).
const ACCENT = ["#38bdf8", "#f59e0b", "#34d399", "#a78bfa", "#fb7185", "#22d3ee"];
const hex = (c: string, a: number) => c + Math.round(a * 255).toString(16).padStart(2, "0");

// ── Designed visuals, one per feature (tinted by accent) ────────────────────
function VMap({ c }: { c: string }) {
  const pts: [string, string, boolean][] = [
    ["50%", "26%", true], ["22%", "50%", false], ["78%", "46%", true],
    ["36%", "76%", false], ["68%", "74%", true],
  ];
  return (
    <div className="relative h-full w-full">
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {[["50%", "26%", "22%", "50%"], ["50%", "26%", "78%", "46%"], ["78%", "46%", "68%", "74%"], ["22%", "50%", "36%", "76%"]].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={hex(c, 0.5)} strokeWidth="1.5" />
        ))}
      </svg>
      {pts.map(([l, t, on], i) => (
        <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: l, top: t }}>
          <span className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] text-foreground"
            style={{ borderColor: on ? hex(c, 0.6) : undefined, background: on ? hex(c, 0.15) : "var(--muted, #1e293b)" }}>
            <span className="h-2 w-2 rounded-full" style={{ background: on ? c : "#64748b" }} />điểm
          </span>
        </div>
      ))}
    </div>
  );
}
function VToday({ c }: { c: string }) {
  return (
    <div className="flex h-full flex-col justify-center gap-3">
      <p className={EB}>☀️ Hôm nay</p>
      <div className="rounded-lg border bg-card p-3" style={{ borderColor: hex(c, 0.4) }}>
        <p className="text-sm font-medium text-foreground">Đăng góc “pháp lý + tiến độ”</p>
        <p className="mt-1 text-xs text-muted-foreground">Theo nhịp tuần · còn 3 ngày tới mốc</p>
        <span className="mt-2 inline-block rounded-md px-2.5 py-1 text-[11px] font-medium text-white" style={{ background: c }}>Tạo bài ngay →</span>
      </div>
      <span className="self-start rounded-full border border-amber-700/60 bg-amber-950/30 px-2.5 py-1 text-[11px] text-amber-300">🔥 7 ngày liên tục</span>
    </div>
  );
}
function VVerified({ c }: { c: string }) {
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      <span className="self-start rounded-full px-2.5 py-1 text-[11px] text-white" style={{ background: c }}>✓ Đã xác thực</span>
      {["Giá 92–102 tr/m²", "Bàn giao Q2/2027", "Pháp lý: đang chờ sổ"].map((t) => (
        <div key={t} className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground">
          <span style={{ color: c }}>✓</span>{t}
        </div>
      ))}
      <div className="flex items-center gap-2 rounded-md border border-dashed border-red-800/50 px-3 py-2 text-sm text-red-300/80">
        <span>✕</span>“cam kết sinh lời” — bị chặn
      </div>
    </div>
  );
}
function VPrompt({ c }: { c: string }) {
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      <p className={EB}>🤖 Prompt AI</p>
      <div className="rounded-lg border bg-background-subtle p-3 font-mono text-[11px] leading-relaxed text-muted-foreground" style={{ borderColor: hex(c, 0.4) }}>
        <span className="text-foreground">① DỮ LIỆU ĐÃ XÁC THỰC</span><br />• Dự án · Giá · Pháp lý<br />
        <span className="text-foreground">⑤ QUY TẮC</span> — không thêm số liệu…
      </div>
      <span className="self-start rounded-md px-3 py-1.5 text-[11px] text-white" style={{ background: c }}>✓ Đã copy — dán sang ChatGPT/Gemini</span>
    </div>
  );
}
function VBrand({ c }: { c: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="relative aspect-square w-3/4 overflow-hidden rounded-lg" style={{ background: `linear-gradient(135deg, ${hex(c, 0.35)}, transparent)` }}>
        <div className="absolute inset-0 grid place-items-center text-4xl opacity-40">🏠</div>
        <span className="absolute bottom-2 right-2 rounded px-2 py-1 text-[10px] text-white" style={{ background: c }}>LOGO · SĐT</span>
        <span className="absolute left-2 top-2 rounded bg-white/15 px-1.5 py-0.5 text-[9px] text-white backdrop-blur">9:16</span>
      </div>
    </div>
  );
}
function VCalendar({ c }: { c: string }) {
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      <p className={EB}>🗓️ Lịch & deadline</p>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 28 }).map((_, i) => (
          <div key={i} className="flex aspect-square items-center justify-center rounded text-[10px]"
            style={i === 12 ? { background: c, color: "#fff" } : i === 19 ? { border: `1px solid ${hex(c, 0.6)}`, color: c } : { background: "var(--muted,#1e293b)", color: "#94a3b8" }}>
            {i === 19 ? "⏳" : i % 7 === 5 || i % 7 === 6 ? "" : "·"}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Chấm = đã đăng · ⏳ = hạn chiến dịch</p>
    </div>
  );
}
const VISUALS = [VMap, VToday, VVerified, VPrompt, VBrand, VCalendar];

function Visual({ i }: { i: number }) {
  const V = VISUALS[i % VISUALS.length];
  const c = ACCENT[i % ACCENT.length];
  return (
    <div className="h-full w-full rounded-xl border bg-card/85 p-5 backdrop-blur" style={{ borderColor: hex(c, 0.35) }}>
      <V c={c} />
    </div>
  );
}

// Sticky scrollytelling — bold, varied motion: per-feature colour, a tilted 3D
// panel with coloured shadow, and scenes that flip in (direction alternates).
export function FeatureScroll({ features }: { features: Feature[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (ents) => ents.forEach((e) => { if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i)); }),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const c = ACCENT[active % ACCENT.length];
  const tiltY = active % 2 ? 9 : -9; // alternate tilt each step → less monotonous

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-2">
      <div>
        {features.map((f, i) => {
          const on = active === i;
          const ac = ACCENT[i % ACCENT.length];
          return (
            <div
              key={f.title}
              data-i={i}
              ref={(el) => { refs.current[i] = el; }}
              className={`relative flex min-h-[64vh] flex-col justify-center transition-all duration-500 ease-out will-change-transform motion-reduce:transition-none ${on ? "translate-x-0 scale-100 opacity-100 blur-0" : "-translate-x-2 scale-[0.92] opacity-30 blur-[2px]"}`}
            >
              <div className="pointer-events-none absolute -left-16 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full blur-3xl transition-opacity duration-700"
                style={{ background: ac, opacity: on ? 0.2 : 0 }} />
              <div className="relative">
                <div className="flex items-center gap-3">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl text-2xl transition-all duration-500"
                    style={on ? { background: `linear-gradient(135deg, ${hex(ac, 0.9)}, ${hex(ac, 0.5)})`, boxShadow: `0 12px 30px -8px ${hex(ac, 0.7)}`, transform: "scale(1.1)" } : { background: "var(--muted,#1e293b)", transform: "scale(0.9)" }}>
                    {f.icon}
                  </span>
                  <span className="text-5xl font-bold leading-none" style={{ color: hex(ac, on ? 0.25 : 0.08) }}>{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{f.title}</h3>
                <span className="mt-2 block h-1 rounded-full transition-all duration-500" style={{ background: ac, width: on ? 64 : 0, opacity: on ? 1 : 0 }} />
                <p className="mt-3 max-w-md text-lg leading-relaxed text-muted-foreground">{f.desc}</p>
                <p className="mt-2 max-w-md leading-relaxed text-muted-foreground/80">{f.back}</p>
                <div className="mt-6 h-[300px] rounded-2xl p-3 lg:hidden" style={{ background: `linear-gradient(135deg, ${hex(ac, 0.25)}, transparent)` }}>
                  <Visual i={i} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-0 flex h-screen items-center [perspective:1400px]">
          <div
            className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] border border-white/10 p-5 transition-all duration-700 ease-out [transform-style:preserve-3d]"
            style={{
              background: `linear-gradient(135deg, ${hex(c, 0.28)}, ${hex(c, 0.05)} 60%, transparent)`,
              transform: `rotateX(4deg) rotateY(${tiltY}deg)`,
              boxShadow: `0 40px 90px -25px ${hex(c, 0.55)}, inset 0 1px 0 0 rgba(255,255,255,0.12)`,
            }}
          >
            <span className="pointer-events-none absolute -right-3 -top-12 select-none text-[160px] font-bold leading-none" style={{ color: hex(c, 0.12) }}>{String(active + 1).padStart(2, "0")}</span>
            {features.map((_, i) => {
              const on = active === i;
              return (
                <div key={i} className="absolute inset-5 transition-all duration-700 ease-out will-change-transform motion-reduce:transition-none"
                  style={{
                    opacity: on ? 1 : 0,
                    transform: on ? "rotateY(0deg) translateZ(40px)" : `rotateY(${i % 2 ? 22 : -22}deg) translateZ(-40px)`,
                    pointerEvents: on ? undefined : "none",
                  }}>
                  <Visual i={i} />
                </div>
              );
            })}
            <div className="absolute right-4 top-4 z-10 flex flex-col gap-1.5">
              {features.map((_, i) => (
                <span key={i} className="w-1.5 rounded-full transition-all duration-300"
                  style={{ height: active === i ? 24 : 6, background: active === i ? c : "rgba(255,255,255,0.3)" }} />
              ))}
            </div>
            <div className="absolute inset-x-5 bottom-3 z-10 h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((active + 1) / features.length) * 100}%`, background: c }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
