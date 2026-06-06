// Brand mark for "Trợ lý BĐS": a stacked-roofline glyph (two ascending roofs =
// growth + real estate) in a gradient tile, with optional wordmark.
export function Logo({ withWordmark = true, className = "" }: { withWordmark?: boolean; className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-[10px] bg-gradient-to-br from-sky-500 to-indigo-600 shadow-[0_6px_16px_-6px_rgba(56,130,246,0.7)]">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <path d="M4 13.5 9 9l4 3 7-5.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
          <path d="M4 18.5 9 14l4 3 7-5.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {withWordmark && (
        <span className="font-semibold tracking-tight text-foreground">
          Trợ lý <span className="text-brand">BĐS</span>
        </span>
      )}
    </span>
  );
}
