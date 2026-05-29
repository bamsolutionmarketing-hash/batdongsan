import type { GuidanceLevel, GuidanceResult } from "@/lib/data/types";

const LEVEL_STYLE: Record<GuidanceLevel, string> = {
  info: "border-sky-500/40 bg-sky-500/10 text-sky-200",
  tip: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-200",
};

const LEVEL_LABEL: Record<GuidanceLevel, string> = {
  info: "Thông tin",
  tip: "Gợi ý",
  warning: "Cảnh báo",
};

export function GuidancePanel({ result, title }: { result: GuidanceResult; title: string }) {
  return (
    <aside className="flex w-full flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900 p-4">
      <header>
        <p className="text-xs uppercase tracking-wide text-slate-500">Guidance</p>
        <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      </header>
      <ul className="flex flex-col gap-2">
        {result.items.map((item) => (
          <li key={item.id} className={`rounded-md border p-3 ${LEVEL_STYLE[item.level]}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{item.title}</span>
              <span className="text-[10px] uppercase tracking-wide opacity-70">{LEVEL_LABEL[item.level]}</span>
            </div>
            <p className="mt-1 text-sm opacity-90">{item.detail}</p>
          </li>
        ))}
      </ul>
    </aside>
  );
}
