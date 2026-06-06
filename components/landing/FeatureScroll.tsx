"use client";

import { useEffect, useRef, useState } from "react";

export interface Feature {
  icon: string;
  title: string;
  desc: string;
  back: string;
}

const EB = "text-[11px] uppercase tracking-widest text-muted-foreground";

// Per-feature gradient for the sticky panel backdrop.
const THEME = [
  "from-sky-500/30 to-indigo-500/10",
  "from-amber-400/30 to-orange-500/10",
  "from-emerald-500/30 to-teal-500/10",
  "from-violet-500/30 to-fuchsia-500/10",
  "from-rose-500/25 to-pink-500/10",
  "from-cyan-500/30 to-blue-500/10",
];

// ── Designed visuals, one per feature (no stock photos) ─────────────────────
function VMap() {
  const pts: [string, string, boolean][] = [
    ["50%", "26%", true], ["22%", "50%", false], ["78%", "46%", true],
    ["36%", "76%", false], ["68%", "74%", true],
  ];
  return (
    <div className="relative h-full w-full">
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <line x1="50%" y1="26%" x2="22%" y2="50%" className="stroke-brand/40" strokeWidth="1.5" />
        <line x1="50%" y1="26%" x2="78%" y2="46%" className="stroke-brand/40" strokeWidth="1.5" />
        <line x1="78%" y1="46%" x2="68%" y2="74%" className="stroke-brand/40" strokeWidth="1.5" />
        <line x1="22%" y1="50%" x2="36%" y2="76%" className="stroke-brand/40" strokeWidth="1.5" />
      </svg>
      {pts.map(([l, t, on], i) => (
        <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: l, top: t }}>
          <span className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${on ? "border-brand/60 bg-brand/15 text-foreground" : "border-border bg-muted text-muted-foreground"}`}>
            <span className={`h-2 w-2 rounded-full ${on ? "bg-brand" : "bg-muted-foreground/50"}`} />điểm
          </span>
        </div>
      ))}
    </div>
  );
}
function VToday() {
  return (
    <div className="flex h-full flex-col justify-center gap-3">
      <p className={EB}>☀️ Hôm nay</p>
      <div className="rounded-lg border border-sky-700/40 bg-card p-3">
        <p className="text-sm font-medium text-foreground">Đăng góc “pháp lý + tiến độ”</p>
        <p className="mt-1 text-xs text-muted-foreground">Theo nhịp tuần · còn 3 ngày tới mốc</p>
        <span className="mt-2 inline-block rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground">Tạo bài ngay →</span>
      </div>
      <span className="self-start rounded-full border border-amber-700/60 bg-amber-950/30 px-2.5 py-1 text-[11px] text-amber-300">🔥 7 ngày liên tục</span>
    </div>
  );
}
function VVerified() {
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      <span className="self-start rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] text-emerald-400">✓ Đã xác thực</span>
      {["Giá 92–102 tr/m²", "Bàn giao Q2/2027", "Pháp lý: đang chờ sổ"].map((t) => (
        <div key={t} className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground">
          <span className="text-emerald-400">✓</span>{t}
        </div>
      ))}
      <div className="flex items-center gap-2 rounded-md border border-dashed border-red-800/50 px-3 py-2 text-sm text-red-300/80">
        <span>✕</span>“cam kết sinh lời” — bị chặn
      </div>
    </div>
  );
}
function VPrompt() {
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      <p className={EB}>🤖 Prompt AI</p>
      <div className="rounded-lg border border-border bg-background-subtle p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
        <span className="text-foreground">① DỮ LIỆU ĐÃ XÁC THỰC</span><br />• Dự án · Giá · Pháp lý<br />
        <span className="text-foreground">⑤ QUY TẮC</span> — không thêm số liệu…
      </div>
      <span className="self-start rounded-md border border-border bg-card px-3 py-1.5 text-[11px] text-foreground">✓ Đã copy — dán sang ChatGPT/Gemini</span>
    </div>
  );
}
function VBrand() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="relative aspect-square w-3/4 overflow-hidden rounded-lg bg-gradient-to-br from-muted to-background-subtle">
        <div className="absolute inset-0 grid place-items-center text-4xl opacity-30">🏠</div>
        <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-1 text-[10px] text-white">LOGO · SĐT</span>
        <span className="absolute left-2 top-2 rounded bg-white/15 px-1.5 py-0.5 text-[9px] text-white backdrop-blur">9:16</span>
      </div>
    </div>
  );
}
function VCalendar() {
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      <p className={EB}>🗓️ Lịch & deadline</p>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 28 }).map((_, i) => (
          <div key={i} className={`flex aspect-square items-center justify-center rounded text-[10px] ${i === 12 ? "bg-sky-600 text-white" : i === 19 ? "border border-amber-700/60 text-amber-300" : "bg-muted text-muted-foreground"}`}>
            {i === 19 ? "⏳" : i % 7 === 5 || i % 7 === 6 ? "" : "·"}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Chấm xanh = đã đăng · ⏳ = hạn chiến dịch</p>
    </div>
  );
}
const VISUALS = [VMap, VToday, VVerified, VPrompt, VBrand, VCalendar];

function Visual({ i }: { i: number }) {
  const V = VISUALS[i % VISUALS.length];
  return (
    <div className="h-full w-full rounded-lg border border-border bg-card/80 p-5 backdrop-blur">
      <V />
    </div>
  );
}

// Sticky scrollytelling with strong motion: inactive items recede (dim + blur +
// scale + slide), the active one pops; the sticky visual zooms/blurs in.
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

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-2">
      <div>
        {features.map((f, i) => {
          const on = active === i;
          return (
            <div
              key={f.title}
              data-i={i}
              ref={(el) => { refs.current[i] = el; }}
              className={`flex min-h-[64vh] flex-col justify-center transition-all duration-500 ease-out will-change-transform motion-reduce:transition-none ${on ? "translate-x-0 scale-100 opacity-100 blur-0" : "-translate-x-2 scale-[0.92] opacity-30 blur-[2px]"}`}
            >
              <div className="flex items-center gap-3">
                <span className={`grid h-14 w-14 place-items-center rounded-2xl text-2xl transition-all duration-500 ${on ? `scale-110 bg-gradient-to-br ${THEME[i % THEME.length]} text-foreground shadow-lg ring-2 ring-foreground/10` : "scale-90 bg-muted"}`}>{f.icon}</span>
                <span className={`text-5xl font-bold leading-none transition-colors duration-500 ${on ? "text-foreground/15" : "text-foreground/5"}`}>{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{f.title}</h3>
              <span className={`mt-2 h-1 rounded-full bg-gradient-to-r transition-all duration-500 ${THEME[i % THEME.length]} ${on ? "w-16 opacity-100" : "w-0 opacity-0"}`} />
              <p className="mt-3 max-w-md text-lg leading-relaxed text-muted-foreground">{f.desc}</p>
              <p className="mt-2 max-w-md leading-relaxed text-muted-foreground/80">{f.back}</p>
              <div className={`mt-6 h-[300px] rounded-xl bg-gradient-to-br p-3 lg:hidden ${THEME[i % THEME.length]}`}>
                <Visual i={i} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-0 flex h-screen items-center">
          <div className={`relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br p-5 shadow-card transition-all duration-700 ${THEME[active % THEME.length]}`}>
            <span className="pointer-events-none absolute -right-3 -top-10 select-none text-[150px] font-bold leading-none text-foreground/5">{String(active + 1).padStart(2, "0")}</span>
            {features.map((_, i) => (
              <div key={i} className={`absolute inset-5 transition-all duration-700 ease-out will-change-transform motion-reduce:transition-none ${active === i ? "scale-100 opacity-100 blur-0" : "pointer-events-none scale-110 opacity-0 blur-md"}`}>
                <Visual i={i} />
              </div>
            ))}
            <div className="absolute right-4 top-4 z-10 flex flex-col gap-1.5">
              {features.map((_, i) => (
                <span key={i} className={`w-1.5 rounded-full transition-all duration-300 ${active === i ? "h-6 bg-foreground" : "h-1.5 bg-foreground/30"}`} />
              ))}
            </div>
            <div className="absolute inset-x-5 bottom-3 z-10 h-1 overflow-hidden rounded-full bg-foreground/10">
              <div className="h-full rounded-full bg-foreground/70 transition-all duration-500" style={{ width: `${((active + 1) / features.length) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
