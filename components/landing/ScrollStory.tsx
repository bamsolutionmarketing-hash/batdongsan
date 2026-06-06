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

/* ── ONE consistent journey threaded through all three cards ──────────────
   Project = Vinhomes Grand Park. The user picks exactly 2 of its knowledge
   points (Metro số 1 + Công viên 36ha). Those same 2 points drive the caption
   in card 2, and that same caption + branded image is exported in card 3. */
const PROJECT = "Vinhomes Grand Park";
const PROJECT_SHORT = "VGP";
const PICKED = "Metro số 1 · Công viên 36ha";
// [label, left%, top%, picked]  — index 0 is the project hub.
const POINTS: [string, number, number, boolean][] = [
  ["Grand Park", 50, 46, true],
  ["Metro số 1", 20, 24, true],
  ["Vành đai 3", 80, 26, false],
  ["Công viên 36ha", 24, 78, true],
  ["Ưu đãi 0%", 78, 74, false],
];
const CAPTIONS = [
  "Vinhomes Grand Park — bước ra là công viên 36ha, vài phút tới Metro số 1. Sống xanh, đi lại nhanh. 🌳🚆",
  "Sáng dạo công viên 36ha, chiều lên Metro số 1 vào trung tâm — nhịp sống Vinhomes Grand Park.",
  "Căn hộ Vinhomes Grand Park: liền kề Metro số 1 + công viên 36ha lớn nhất khu Đông. Nhận bảng giá ngay.",
];

// Card 1 — points pop in; lines connect the 2 picked points to the project hub.
function ScreenChoose({ play }: { play: boolean }) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className={EB}>Bản đồ tri thức</p>
        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">🏢 {PROJECT}</span>
      </div>
      <div className="relative mt-3 flex-1">
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          {play && POINTS.slice(1).map(([, l, t, on], i) => (
            <line key={i} x1={`${POINTS[0][1]}%`} y1={`${POINTS[0][2]}%`} x2={`${l}%`} y2={`${t}%`}
              className={`lp-line ${on ? "stroke-brand" : "stroke-border"}`} strokeWidth={on ? 1.6 : 1.2}
              style={{ animationDelay: `${0.9 + i * 0.12}s` }} />
          ))}
        </svg>
        {POINTS.map(([label, l, t, on], i) => (
          <div key={i} className={play ? "lp-node absolute" : "absolute opacity-0"} style={{ left: `${l}%`, top: `${t}%`, animationDelay: `${i * 0.14}s` }}>
            <div className="-translate-x-1/2 -translate-y-1/2">
              {i === 0 ? (
                <div className="rounded-full bg-brand px-3 py-1 text-[11px] font-medium text-white shadow">{label}</div>
              ) : (
                <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${on ? "border-brand/60 bg-brand/10 text-foreground" : "border-border bg-muted text-muted-foreground"}`}>
                  <span className={`grid h-2.5 w-2.5 place-items-center rounded-full text-[7px] text-white ${on ? "bg-brand" : "bg-muted-foreground/40"}`}>{on ? "✓" : ""}</span>{label}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">Đã chọn <span className="font-medium text-foreground">2/4</span> điểm: {PICKED}</p>
    </div>
  );
}

// Card 2 — caption (built from the 2 picked points) types out; chips re-roll it.
const TPL = ["Facebook", "Zalo", "Chuyên gia", "Kể chuyện"];
function ScreenCompose({ play }: { play: boolean }) {
  const [tpl, setTpl] = useState(0);
  useEffect(() => {
    if (!play) return;
    const id = setInterval(() => setTpl((t) => (t + 1) % TPL.length), 2600);
    return () => clearInterval(id);
  }, [play]);
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className={EB}>Soạn & đổi mẫu</p>
        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">🏢 {PROJECT}</span>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">Từ 2 điểm: <span className="font-medium text-foreground">{PICKED}</span></p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {TPL.map((p, i) => (
          <span key={p} className={`rounded-full px-2.5 py-1 text-[11px] transition-colors duration-300 ${i === tpl ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}>{p}</span>
        ))}
      </div>
      <div className="mt-3 flex-1 rounded-md border border-border bg-background-subtle p-3 text-sm leading-relaxed text-foreground">
        {play ? <Typer phrases={CAPTIONS} /> : CAPTIONS[0]}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-brand" /> dữ liệu đã xác thực · không bịa số
      </div>
    </div>
  );
}

// Card 3 — the SAME caption + a branded 9:16 image; drag the image to download.
function ScreenExport({ play }: { play: boolean }) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className={EB}>Tải bài + ảnh</p>
        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">🏢 {PROJECT}</span>
      </div>
      <div className="relative mt-3 flex-1">
        {/* download tray (drop target) */}
        <div className="absolute bottom-0 right-0 grid h-16 w-24 place-items-center rounded-lg border-2 border-dashed border-border text-muted-foreground">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
          {play && <span className="lp-dropok absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-brand text-[10px] text-white">✓</span>}
        </div>
        {/* generated branded 9:16 image being dragged out */}
        {play && (
          <div className="lp-drag absolute left-0 top-0 w-[34%]">
            <div className="relative aspect-[9/16] overflow-hidden rounded-md border border-brand/50 bg-gradient-to-br from-brand/30 to-muted shadow-lg">
              <span className="absolute left-1 top-1 rounded bg-background/70 px-1 text-[7px] text-muted-foreground">9:16</span>
              <span className="absolute inset-x-1 bottom-1 truncate rounded bg-foreground/85 px-1 py-0.5 text-center text-[7px] font-medium text-background">{PROJECT_SHORT} · 0901 234 567</span>
            </div>
            <svg viewBox="0 0 24 24" className="absolute -bottom-2 -right-2 h-5 w-5 text-foreground drop-shadow" fill="currentColor"><path d="M5 3l15 9-6 1.5L11 20 5 3z" /></svg>
          </div>
        )}
      </div>
      <div className="mt-3 rounded-md border border-border bg-background-subtle p-2.5 text-[11px] leading-relaxed text-foreground">{CAPTIONS[0]}</div>
      <div className="mt-2 flex gap-2">
        <span className="rounded-md bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground">Copy bài</span>
        <span className="rounded-md border border-border px-3 py-1.5 text-[11px] text-muted-foreground">↓ Ảnh 9:16</span>
      </div>
    </div>
  );
}

const STEPS = [
  { k: "01", title: "Chọn điểm trên bản đồ", desc: "Mở dự án Vinhomes Grand Park, chạm 2 điểm muốn kể: Metro số 1 và công viên 36ha." },
  { k: "02", title: "Máy soạn — bạn đổi mẫu", desc: "Caption dựng đúng 2 điểm đã chọn. Đổi nền tảng, giọng văn đến khi ưng ý." },
  { k: "03", title: "Tải bài + ảnh, đăng ngay", desc: "Copy đúng caption đó và tải ảnh 9:16 đã đóng logo — đăng thẳng Facebook/Zalo." },
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
