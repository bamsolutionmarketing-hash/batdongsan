"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

// Pinned HORIZONTAL scroller (lg+): the section pins and the step panels slide
// left as you scroll vertically (GSAP ScrollTrigger). Mobile: vertical stack.
export function ScrollStory() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    const section = sectionRef.current, track = trackRef.current;
    if (!section || !track) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const dist = () => track.scrollWidth - window.innerWidth;
      gsap.to(track, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          start: "top top",
          end: () => "+=" + dist(),
          invalidateOnRefresh: true,
          onUpdate: (self) => { if (fillRef.current) fillRef.current.style.width = `${self.progress * 100}%`; },
        },
      });
    }, section);

    const id = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => { clearTimeout(id); ctx.revert(); };
  }, []);

  return (
    <>
      {/* desktop: pinned horizontal track */}
      <section ref={sectionRef} className="relative hidden overflow-hidden bg-background lg:block">
        <div ref={trackRef} className="flex h-screen w-max">
          {STEPS.map((s, i) => (
            <div key={i} className="flex h-screen w-screen flex-none items-center">
              <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-10 lg:grid-cols-2">
                <div>
                  <span className="text-6xl font-semibold tracking-tight text-foreground/15">{s.k}</span>
                  <h3 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">{s.title}</h3>
                  <span className="mt-4 block h-px w-12 rounded-full bg-brand" />
                  <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
                <div className="h-[440px]"><Screen i={i} active /></div>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 z-10 h-0.5 bg-border">
          <div ref={fillRef} className="h-full bg-brand" style={{ width: "0%" }} />
        </div>
      </section>

      {/* mobile: vertical stack */}
      <section className="bg-background lg:hidden">
        <div className="mx-auto flex max-w-xl flex-col gap-10 px-5 py-12">
          {STEPS.map((s, i) => (
            <div key={i}>
              <span className="text-4xl font-semibold tracking-tight text-foreground/20">{s.k}</span>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{s.desc}</p>
              <div className="mt-4 h-[280px] rounded-2xl border border-border bg-card p-4 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.5)]">
                <Screen i={i} active />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
