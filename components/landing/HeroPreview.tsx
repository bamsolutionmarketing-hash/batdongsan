// Content-first hero preview: a soft bento of product surfaces (neutral tokens).
export function HeroPreview() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {/* Caption card */}
      <div className="col-span-2 rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="flex gap-1.5">
          {["FB Post", "Chuyên gia"].map((p) => (
            <span key={p} className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] text-primary-foreground">{p}</span>
          ))}
          <span className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground">Zalo</span>
        </div>
        <div className="mt-3 space-y-1.5">
          {[95, 88, 70].map((w, i) => <div key={i} className="h-2.5 rounded-full bg-muted" style={{ width: `${w}%` }} />)}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground"><span className="text-brand">✓</span> Chỉ dùng số liệu đã xác thực</p>
      </div>
      {/* Map card */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-card">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Bản đồ</p>
        <div className="relative mt-3 h-24">
          {[["48%", "40%", true], ["20%", "20%", false], ["78%", "30%", false], ["30%", "76%", false]].map(([l, t, on], i) => (
            <span key={i} className={`absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${on ? "bg-brand ring-4 ring-brand/20" : "bg-muted-foreground/40"}`} style={{ left: l as string, top: t as string }} />
          ))}
        </div>
      </div>
      {/* Image card */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-card">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Ảnh đóng logo</p>
        <div className="mt-3 aspect-video rounded-md bg-muted" />
        <div className="mt-2 flex gap-1.5">
          <span className="rounded bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">↓ Feed</span>
          <span className="rounded border border-border px-2 py-0.5 text-[10px] text-muted-foreground">↓ Story</span>
        </div>
      </div>
    </div>
  );
}
