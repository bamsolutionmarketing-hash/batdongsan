"use client";

import { useEffect, useRef, useState } from "react";

const EB = "text-xs uppercase tracking-widest text-muted-foreground";

function ScreenChoose({ active }: { active: boolean }) {
  return (
    <div className="h-full w-full rounded-lg border border-border bg-card p-5 shadow-card">
      <p className={EB}>Bản đồ tri thức</p>
      <div className="relative mt-4 h-[280px]">
        {[
          ["Gladia", "52%", "44%", true],
          ["Vành đai 3", "18%", "22%", false],
          ["Long Thành", "78%", "20%", false],
          ["Green Mark", "24%", "72%", true],
          ["Keppel", "74%", "70%", false],
        ].map(([label, l, t, on], i) => (
          <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: l as string, top: t as string }}>
            <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-all duration-500 ${active && on ? "border-brand/60 bg-brand/10 text-foreground" : "border-border bg-muted text-muted-foreground"}`}>
              <span className={`h-2 w-2 rounded-full ${active && on ? "bg-brand" : "bg-muted-foreground/50"}`} />{label as string}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function ScreenCompose({ active }: { active: boolean }) {
  return (
    <div className="h-full w-full rounded-lg border border-border bg-card p-5 shadow-card">
      <p className={EB}>Soạn & đổi mẫu</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {["FB Post", "Zalo", "Chuyên gia", "Kể chuyện"].map((p, i) => (
          <span key={p} className={`rounded-full px-2.5 py-1 text-[11px] ${i === 0 || i === 2 ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}>{p}</span>
        ))}
      </div>
      <div className="mt-4 space-y-2 rounded-md border border-border bg-background-subtle p-3">
        {[90, 80, 95, 60].map((w, i) => (
          <div key={i} className="h-2.5 rounded-full bg-muted-foreground/25 transition-all duration-700" style={{ width: active ? `${w}%` : "20%" }} />
        ))}
      </div>
    </div>
  );
}
function ScreenExport({ active }: { active: boolean }) {
  return (
    <div className="h-full w-full rounded-lg border border-border bg-card p-5 shadow-card">
      <p className={EB}>Tải bài + ảnh</p>
      <div className={`mt-4 grid grid-cols-2 gap-2 transition-opacity duration-700 ${active ? "opacity-100" : "opacity-40"}`}>
        <div className="aspect-video rounded-md bg-muted" />
        <div className="aspect-video rounded-md bg-muted" />
      </div>
      <div className="mt-3 flex gap-2">
        <span className="rounded-md bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground">Copy bài</span>
        <span className="rounded-md border border-border px-3 py-1.5 text-[11px] text-muted-foreground">↓ Ảnh</span>
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
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            {STEPS.map((s, i) => (
              <div
                key={i}
                data-i={i}
                ref={(el) => { refs.current[i] = el; }}
                className={`flex min-h-[68vh] flex-col justify-center transition-opacity duration-500 ease-out ${active === i ? "opacity-100" : "opacity-45"}`}
              >
                <span className={`text-5xl font-semibold tracking-tight transition-colors duration-500 ${active === i ? "text-foreground/40" : "text-foreground/15"}`}>{s.k}</span>
                <h3 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{s.title}</h3>
                <span className={`mt-3 block h-px rounded-full bg-brand transition-all duration-500 ${active === i ? "w-12 opacity-100" : "w-0 opacity-0"}`} />
                <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">{s.desc}</p>
                <div className="mt-7 rounded-2xl border border-border bg-card p-4 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.5)] lg:hidden">
                  <div className="h-[280px]"><Screen i={i} active={active === i} /></div>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden lg:block">
            <div className="sticky top-0 flex h-screen items-center">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] border border-border bg-card p-6 shadow-[0_40px_90px_-50px_rgba(0,0,0,0.6)]">
                <span className="pointer-events-none absolute right-5 top-4 select-none text-7xl font-semibold leading-none text-foreground/[0.04]">{STEPS[active].k}</span>
                {STEPS.map((_, i) => (
                  <div key={i} className={`absolute inset-6 flex items-center transition-all duration-500 ease-out ${active === i ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}>
                    <Screen i={i} active={active === i} />
                  </div>
                ))}
                <div className="absolute inset-x-6 bottom-5 flex gap-1.5">
                  {STEPS.map((_, i) => (
                    <span key={i} className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${active === i ? "bg-brand" : "bg-border"}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
