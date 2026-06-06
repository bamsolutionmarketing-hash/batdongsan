// Phone mockup of the "Hôm Nay" screen — with looping micro-animations
// (float, CTA pulse/shine/tap, a toast, streak pulse, checklist ticks).
export function PhoneMock() {
  return (
    <div className="lp-float relative mx-auto w-[260px] shrink-0">
      <div className="rounded-[2.2rem] border border-border bg-background p-2 shadow-card-hover">
        <div className="relative overflow-hidden rounded-[1.7rem] border border-border bg-background">
          <div className="absolute left-1/2 top-0 z-30 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-muted" />

          {/* toast notification slides in periodically */}
          <div className="lp-toast pointer-events-none absolute left-1/2 top-7 z-40 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-foreground px-3 py-1 text-[10px] font-medium text-background shadow-lg">
            <span className="text-brand">✓</span> Đã tạo bài đăng!
          </div>

          <div className="flex flex-col gap-3 p-3 pt-7 text-left">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold tracking-tight text-foreground">Hôm Nay</span>
              <span className="lp-pulse inline-block rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">🔥 6 ngày</span>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-wide text-brand">Gợi ý hôm nay</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] text-muted-foreground">⏳ còn 2 ngày</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-foreground">Bài hạ tầng hôm nay</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Vành đai 3 thông toàn tuyến · còn 2 ngày</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {["Vành đai 3", "Long Thành", "Metro 6"].map((l) => (
                  <span key={l} className="rounded-full border border-border bg-muted px-2 py-0.5 text-[9px] text-muted-foreground">{l}</span>
                ))}
              </div>
              {/* CTA: pulse + shine sweep + tap ripple */}
              <div className="relative mt-2">
                <div className="lp-pulse relative overflow-hidden rounded-md bg-primary px-3 py-1.5 text-center text-[11px] font-medium text-primary-foreground">
                  Tạo bài ngay →
                  <span className="lp-shine pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-white/40" />
                </div>
                <span className="lp-tap pointer-events-none absolute left-1/2 top-1/2 h-9 w-9 rounded-full border-2 border-primary" />
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-2.5">
              <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Việc hôm nay</p>
              {[["🔁", "Chia sẻ bài hôm qua vào group", "0s"], ["📲", "Đăng 1 story (ảnh 9:16)", "1s"]].map(([emo, txt, d]) => (
                <p key={txt} className="mt-1 flex items-center gap-1.5 text-[11px] text-foreground">
                  <span className="lp-check inline-grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-brand text-[7px] text-white" style={{ animationDelay: d }}>✓</span>
                  <span>{emo} {txt}</span>
                </p>
              ))}
            </div>
          </div>
          <div className="flex border-t border-border bg-background text-center text-[8px] text-muted-foreground">
            {[["🏠", "Hôm Nay"], ["🏢", "Dự án"], ["🗓️", "Lịch"], ["📝", "Ghi chú"], ["👤", "Hồ sơ"]].map(([i, l], k) => (
              <span key={l} className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 ${k === 0 ? "text-brand" : ""}`}>
                <span className="text-sm leading-none">{i}</span>{l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
