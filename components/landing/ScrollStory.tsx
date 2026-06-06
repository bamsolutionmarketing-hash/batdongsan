"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const EB = "text-xs uppercase tracking-widest text-muted-foreground";

// Loops through phrases with a typewriter effect (type → hold → delete → next).
function Typer({ phrases }: { phrases: string[] }) {
  const [text, setText] = useState("");
  const [pi, setPi] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const full = phrases[pi];
    let t: ReturnType<typeof setTimeout>;
    if (!del && text === full) t = setTimeout(() => setDel(true), 1300);
    else if (del && text === "") { setDel(false); setPi((p) => (p + 1) % phrases.length); }
    else t = setTimeout(() => setText(del ? full.slice(0, text.length - 1) : full.slice(0, text.length + 1)), del ? 28 : 55);
    return () => clearTimeout(t);
  }, [text, del, pi, phrases]);
  return <span>{text}<span className="lp-caret ml-0.5 inline-block h-[1em] w-px translate-y-[2px] bg-brand align-middle" /></span>;
}

// Card 1 — nodes pop in one by one, then lines connect them to the hub.
const NODES: [string, number, number, boolean][] = [
  ["Gladia", 50, 46, true],
  ["Vành đai 3", 17, 24, false],
  ["Long Thành", 82, 22, false],
  ["Green Mark", 22, 76, true],
  ["Keppel", 78, 74, false],
];
function ScreenChoose({ play }: { play: boolean }) {
  return (
    <div className="h-full w-full rounded-lg border border-border bg-card p-5 shadow-card">
      <p className={EB}>Bản đồ tri thức</p>
      <div className="relative mt-3 h-[300px]">
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          {play && NODES.slice(1).map(([, l, t, on], i) => (
            <line key={i} x1={`${NODES[0][1]}%`} y1={`${NODES[0][2]}%`} x2={`${l}%`} y2={`${t}%`}
              className={`lp-line ${on ? "stroke-brand" : "stroke-border"}`} strokeWidth={on ? 1.6 : 1.2}
              style={{ animationDelay: `${0.9 + i * 0.12}s` }} />
          ))}
        </svg>
        {NODES.map(([label, l, t, on], i) => (
          <div key={i} className={play ? "lp-node absolute" : "absolute opacity-0"} style={{ left: `${l}%`, top: `${t}%`, animationDelay: `${i * 0.14}s` }}>
            <div className={`-translate-x-1/2 -translate-y-1/2 ${i === 0 ? "scale-110" : ""}`}>
              <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${on ? "border-brand/60 bg-brand/10 text-foreground" : "border-border bg-muted text-muted-foreground"}`}>
                <span className={`h-2 w-2 rounded-full ${on ? "bg-brand" : "bg-muted-foreground/50"}`} />{label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Card 2 — template chips cycle while the caption types itself out.
const TPL = ["FB Post", "Zalo", "Chuyên gia", "Kể chuyện"];
const CAPTIONS = [
  "Gladia Q7 — căn 2PN, view sông, bàn giao 2026.",
  "Quỹ căn cuối Green Mark, chính sách 0% lãi 18 tháng.",
  "Cách Keppel kết nối Vành đai 3 chỉ 10 phút.",
];
function ScreenCompose({ play }: { play: boolean }) {
  const [tpl, setTpl] = useState(0);
  useEffect(() => {
    if (!play) return;
    const id = setInterval(() => setTpl((t) => (t + 1) % TPL.length), 2600);
    return () => clearInterval(id);
  }, [play]);
  return (
    <div className="h-full w-full rounded-lg border border-border bg-card p-5 shadow-card">
      <p className={EB}>Soạn & đổi mẫu</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {TPL.map((p, i) => (
          <span key={p} className={`rounded-full px-2.5 py-1 text-[11px] transition-colors duration-300 ${i === tpl ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}>{p}</span>
        ))}
      </div>
      <div className="mt-4 min-h-[120px] rounded-md border border-border bg-background-subtle p-3 text-sm leading-relaxed text-foreground">
        {play ? <Typer phrases={CAPTIONS} /> : CAPTIONS[0]}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-brand" /> dữ liệu đã xác thực · không bịa số
      </div>
    </div>
  );
}

// Card 3 — a cursor grabs an image and drags it into the download tray.
function ScreenExport({ play }: { play: boolean }) {
  return (
    <div className="h-full w-full rounded-lg border border-border bg-card p-5 shadow-card">
      <p className={EB}>Tải bài + ảnh</p>
      <div className="relative mt-4 h-[210px]">
        {/* source thumbnails */}
        <div className="grid grid-cols-2 gap-2">
          <div className="aspect-video rounded-md bg-gradient-to-br from-muted to-background-subtle" />
          <div className="aspect-video rounded-md bg-gradient-to-br from-muted to-background-subtle" />
        </div>
        {/* download tray (drop target) */}
        <div className="absolute bottom-0 right-0 grid h-16 w-24 place-items-center rounded-lg border-2 border-dashed border-border text-muted-foreground">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
          {play && <span className="lp-dropok absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-brand text-[10px] text-white">✓</span>}
        </div>
        {/* dragged image + cursor (move together) */}
        {play && (
          <div className="lp-drag absolute left-0 top-0 w-[46%]">
            <div className="aspect-video rounded-md border border-brand/50 bg-gradient-to-br from-brand/25 to-muted shadow-lg" />
            <svg viewBox="0 0 24 24" className="absolute -bottom-2 -right-2 h-5 w-5 text-foreground drop-shadow" fill="currentColor"><path d="M5 3l15 9-6 1.5L11 20 5 3z" /></svg>
          </div>
        )}
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

function Screen({ i, play }: { i: number; play: boolean }) {
  if (i === 0) return <ScreenChoose play={play} />;
  if (i === 1) return <ScreenCompose play={play} />;
  return <ScreenExport play={play} />;
}

// Pinned HORIZONTAL scroller (lg+): the section pins and the step panels slide
// left as you scroll vertically (GSAP ScrollTrigger). Mobile: vertical stack.
export function ScrollStory() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

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
          onUpdate: (self) => {
            if (fillRef.current) fillRef.current.style.width = `${self.progress * 100}%`;
            setActive(Math.round(self.progress * (STEPS.length - 1)));
          },
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
                <div className="h-[440px]"><Screen key={`${i}-${active === i}`} i={i} play={active === i} /></div>
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
                <Screen i={i} play />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
