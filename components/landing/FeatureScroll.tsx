"use client";

import { useEffect, useRef, useState } from "react";
import { ICONS, type IconKey } from "./Icons";

export interface Feature {
  icon: IconKey;
  title: string;
  desc: string;
  back: string;
  img: string;
  stamp?: string; // phone number → renders a watermark + stamp demo on the photo
}

// Repeated diagonal watermark + a corner "stamp" — demonstrates the branded-image
// feature directly on the photo.
function Watermark({ phone }: { phone: string }) {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.18] [transform:rotate(-24deg)_scale(1.4)]">
        <div className="flex flex-col gap-6 text-[13px] font-semibold uppercase tracking-widest text-white">
          {Array.from({ length: 7 }).map((_, r) => (
            <div key={r} className="flex gap-6 whitespace-nowrap">
              {Array.from({ length: 5 }).map((_, c) => <span key={c}>BĐS · {phone}</span>)}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute right-3 top-3 grid h-16 w-16 -rotate-12 place-items-center rounded-full border-2 border-white/80 text-center text-white shadow-lg">
        <div>
          <div className="text-[8px] font-bold uppercase leading-tight tracking-widest">Đã đóng dấu</div>
          <div className="text-[10px] font-bold leading-tight">{phone}</div>
        </div>
      </div>
    </>
  );
}

// Sticky scrollytelling — minimalist + real imagery: a clean elevated photo card
// crossfades between features; the active feature is the only one at full
// strength. One brand accent for the index marker + progress.
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

  const Photo = ({ f }: { f: Feature }) => {
    const Ico = ICONS[f.icon];
    return (
      <>
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-background-subtle" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={f.img} alt={f.title} loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} className="absolute inset-0 h-full w-full object-cover" />
        {f.stamp && <Watermark phone={f.stamp} />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/25 bg-white/10 backdrop-blur"><Ico className="h-5 w-5 text-white" /></span>
          <h4 className="mt-3 text-xl font-semibold tracking-tight">{f.title}</h4>
          <p className="mt-1 max-w-xs text-sm leading-relaxed text-white/85">{f.desc}</p>
        </div>
      </>
    );
  };

  return (
    <div className="mt-10 grid gap-12 lg:grid-cols-2">
      <div>
        {features.map((f, i) => {
          const on = active === i;
          const Ico = ICONS[f.icon];
          return (
            <div
              key={f.title}
              data-i={i}
              ref={(el) => { refs.current[i] = el; }}
              className={`flex min-h-[60vh] flex-col justify-center transition-opacity duration-500 ease-out ${on ? "opacity-100" : "opacity-45"}`}
            >
              <div className="flex items-center gap-3">
                <span className={`grid h-11 w-11 place-items-center rounded-xl border transition-colors duration-500 ${on ? "border-brand/40 bg-brand/10 text-brand" : "border-border bg-muted text-muted-foreground"}`}><Ico className="h-5 w-5" /></span>
                <span className="text-sm font-medium text-muted-foreground">{String(i + 1).padStart(2, "0")} / {String(features.length).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{f.title}</h3>
              <span className={`mt-3 block h-px rounded-full bg-brand transition-all duration-500 ${on ? "w-12 opacity-100" : "w-0 opacity-0"}`} />
              <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">{f.desc}</p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground/70">{f.back}</p>
              <div className="relative mt-7 aspect-[16/11] overflow-hidden rounded-2xl border border-border shadow-[0_24px_60px_-40px_rgba(0,0,0,0.5)] lg:hidden">
                <Photo f={f} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-0 flex h-screen items-center">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-[0_40px_90px_-50px_rgba(0,0,0,0.6)]">
            {features.map((f, i) => (
              <div key={f.title} className={`absolute inset-0 transition-all duration-700 ease-out ${active === i ? "scale-100 opacity-100" : "pointer-events-none scale-[1.04] opacity-0"}`}>
                <Photo f={f} />
              </div>
            ))}
            <div className="absolute inset-x-6 top-5 z-10 flex gap-1.5">
              {features.map((_, i) => (
                <span key={i} className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${active === i ? "bg-white" : "bg-white/30"}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
