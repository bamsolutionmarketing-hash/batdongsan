"use client";

import { useEffect, useRef, useState } from "react";

// ── Mini product screens (evocative, not real data) ──────────────────────────
function ScreenChoose({ active }: { active: boolean }) {
  return (
    <div className="h-full w-full rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="eyebrow">Bản đồ tri thức</p>
      <div className="relative mt-4 h-[280px]">
        {[
          ["Gladia", "52%", "44%", true],
          ["Vành đai 3", "18%", "22%", false],
          ["Long Thành", "78%", "20%", false],
          ["Green Mark", "24%", "72%", true],
          ["Keppel", "74%", "70%", false],
        ].map(([label, l, t, on], i) => (
          <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: l as string, top: t as string }}>
            <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-all duration-500 ${active && on ? "border-amber-500/60 bg-amber-500/15 text-amber-200" : "border-slate-700 bg-slate-800 text-slate-300"}`}>
              <span className={`h-2 w-2 rounded-full ${active && on ? "bg-amber-400" : "bg-slate-500"}`} />{label as string}
            </div>
          </div>
        ))}
        <svg className="absolute inset-0 h-full w-full" style={{ zIndex: -1 }}>
          <line x1="52%" y1="44%" x2="24%" y2="72%" stroke="rgba(212,175,95,0.35)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="52%" y1="44%" x2="18%" y2="22%" stroke="rgba(148,163,184,0.2)" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}
function ScreenCompose({ active }: { active: boolean }) {
  return (
    <div className="h-full w-full rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="eyebrow">Soạn & đổi mẫu</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {["FB Post", "Zalo", "Chuyên gia", "Kể chuyện"].map((p, i) => (
          <span key={p} className={`rounded-full px-2.5 py-1 text-[11px] ${i === 0 || i === 2 ? "bg-amber-500/20 text-amber-200" : "border border-slate-700 text-slate-300"}`}>{p}</span>
        ))}
      </div>
      <div className="mt-4 space-y-2 rounded-lg border border-slate-800 bg-slate-950 p-3">
        {[90, 80, 95, 60].map((w, i) => (
          <div key={i} className="h-2.5 rounded-full bg-slate-700/70 transition-all duration-700" style={{ width: active ? `${w}%` : "20%" }} />
        ))}
      </div>
    </div>
  );
}
function ScreenExport({ active }: { active: boolean }) {
  return (
    <div className="h-full w-full rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="eyebrow">Tải bài + ảnh</p>
      <div className={`mt-4 grid grid-cols-2 gap-2 transition-opacity duration-700 ${active ? "opacity-100" : "opacity-40"}`}>
        <div className="aspect-video rounded-md bg-gradient-to-br from-amber-500/30 to-slate-800" />
        <div className="aspect-video rounded-md bg-gradient-to-br from-sky-500/20 to-slate-800" />
      </div>
      <div className="mt-3 flex gap-2">
        <span className="rounded-md bg-gradient-to-r from-amber-300 to-yellow-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950">Copy bài</span>
        <span className="rounded-md border border-slate-700 px-3 py-1.5 text-[11px] text-slate-300">↓ Ảnh</span>
      </div>
    </div>
  );
}

const STEPS = [
  { k: "01", title: "Chọn điểm", desc: "Chạm 1–4 điểm trên bản đồ tri thức của dự án — máy dựng bài quanh đúng câu chuyện." },
  { k: "02", title: "Soạn & đổi mẫu", desc: "Đổi hook / thân / CTA, chọn giọng & định dạng đến khi ưng ý." },
  { k: "03", title: "Tải bài + ảnh", desc: "Copy caption và tải ảnh đóng logo — đăng ngay lên Facebook/Zalo." },
];

function Screen({ i, active }: { i: number; active: boolean }) {
  if (i === 0) return <ScreenChoose active={active} />;
  if (i === 1) return <ScreenCompose active={active} />;
  return <ScreenExport active={active} />;
}

// Sticky scrollytelling: scrolling the left steps swaps the sticky right screen.
export function ScrollStory() {
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
    <section className="bg-slate-950">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left: steps */}
          <div>
            {STEPS.map((s, i) => (
              <div
                key={i}
                data-i={i}
                ref={(el) => { refs.current[i] = el; }}
                className={`flex min-h-[68vh] flex-col justify-center transition-opacity duration-300 ${active === i ? "opacity-100" : "opacity-40"}`}
              >
                <span className="font-display text-5xl text-gold">{s.k}</span>
                <h3 className="font-display mt-2 text-3xl text-amber-50 sm:text-4xl">{s.title}</h3>
                <p className="mt-3 max-w-md leading-relaxed text-slate-400">{s.desc}</p>
                {/* Inline screen on mobile (no sticky column) */}
                <div className="mt-6 h-[320px] lg:hidden">
                  <Screen i={i} active={active === i} />
                </div>
              </div>
            ))}
          </div>
          {/* Right: sticky visual */}
          <div className="hidden lg:block">
            <div className="sticky top-0 flex h-screen items-center justify-center">
              <div className="relative h-[380px] w-full max-w-sm">
                {STEPS.map((_, i) => (
                  <div key={i} className={`absolute inset-0 transition-all duration-500 ${active === i ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}>
                    <Screen i={i} active={active === i} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
