// Static phone mockup showing the "Hôm Nay" screen. Pure markup (no app data).
export function PhoneMock() {
  return (
    <div className="relative mx-auto w-[260px] shrink-0">
      <div className="rounded-[2.2rem] border border-slate-700 bg-slate-950 p-2 shadow-2xl shadow-slate-950/70">
        <div className="relative overflow-hidden rounded-[1.7rem] border border-slate-800 bg-slate-950">
          <div className="absolute left-1/2 top-0 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-slate-800" />
          <div className="flex flex-col gap-3 p-3 pt-7 text-left">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-slate-100">Hôm Nay</span>
              <span className="rounded-full border border-amber-700/60 bg-amber-950/30 px-2 py-0.5 text-[10px] text-amber-300">🔥 6 ngày</span>
            </div>
            <div className="rounded-xl border border-sky-900/50 bg-slate-900 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-wide text-sky-400">Gợi ý hôm nay</span>
                <span className="rounded-full bg-red-950/40 px-2 py-0.5 text-[9px] text-red-300">⏳ còn 2 ngày</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-slate-100">Bài hạ tầng hôm nay</p>
              <p className="mt-0.5 text-[11px] text-slate-400">Vành đai 3 thông toàn tuyến · còn 2 ngày</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {["Vành đai 3", "Long Thành", "Metro 6"].map((l) => (
                  <span key={l} className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[9px] text-slate-300">{l}</span>
                ))}
              </div>
              <div className="mt-2 rounded-md bg-sky-600 px-3 py-1.5 text-center text-[11px] font-medium text-white">Tạo bài ngay →</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5">
              <p className="text-[9px] uppercase tracking-wide text-slate-500">Việc hôm nay</p>
              <p className="mt-1 text-[11px] text-slate-200">🔁 Chia sẻ bài hôm qua vào group</p>
              <p className="mt-1 text-[11px] text-slate-200">📲 Đăng 1 story (ảnh 9:16)</p>
            </div>
          </div>
          <div className="flex border-t border-slate-800 bg-slate-950 text-center text-[8px] text-slate-400">
            {[["🏠", "Hôm Nay"], ["🏢", "Dự án"], ["🗓️", "Lịch"], ["📝", "Ghi chú"], ["👤", "Hồ sơ"]].map(([i, l], k) => (
              <span key={l} className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 ${k === 0 ? "text-sky-400" : ""}`}>
                <span className="text-sm leading-none">{i}</span>{l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
