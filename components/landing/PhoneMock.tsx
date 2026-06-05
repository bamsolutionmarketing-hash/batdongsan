// Static phone mockup showing the "Hôm Nay" screen (neutral tokens).
export function PhoneMock() {
  return (
    <div className="relative mx-auto w-[260px] shrink-0">
      <div className="rounded-[2.2rem] border border-border bg-background p-2 shadow-card-hover">
        <div className="relative overflow-hidden rounded-[1.7rem] border border-border bg-background">
          <div className="absolute left-1/2 top-0 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-muted" />
          <div className="flex flex-col gap-3 p-3 pt-7 text-left">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold tracking-tight text-foreground">Hôm Nay</span>
              <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">🔥 6 ngày</span>
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
              <div className="mt-2 rounded-md bg-primary px-3 py-1.5 text-center text-[11px] font-medium text-primary-foreground">Tạo bài ngay →</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-2.5">
              <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Việc hôm nay</p>
              <p className="mt-1 text-[11px] text-foreground">🔁 Chia sẻ bài hôm qua vào group</p>
              <p className="mt-1 text-[11px] text-foreground">📲 Đăng 1 story (ảnh 9:16)</p>
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
