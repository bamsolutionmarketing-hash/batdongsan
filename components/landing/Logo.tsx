/* eslint-disable @next/next/no-img-element */
// Brand mark for NhaPilot: the NP monogram (public/brand/mark.svg) + an optional
// "NhaPilot" wordmark (blue Nha / silver Pilot).

export function BrandIcon({ className = "h-8 w-8" }: { className?: string }) {
  return <img src="/brand/mark.svg" alt="NhaPilot" className={`shrink-0 object-contain ${className}`} />;
}

// Compact brand lockup (icon + "NhaPilot") for watermarks / corner badges.
export function BrandWatermark({ className = "", onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <span className={`pointer-events-none inline-flex select-none items-center gap-1.5 ${className}`} aria-hidden>
      <img src="/brand/mark.svg" alt="" className="h-4 w-4" />
      <span className={`text-xs font-bold tracking-tight ${onDark ? "text-white" : "text-foreground"}`}>NhaPilot</span>
    </span>
  );
}

export function Logo({ withWordmark = true, className = "" }: { withWordmark?: boolean; className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <BrandIcon className="h-8 w-8" />
      {withWordmark && (
        <span className="text-[1.1rem] font-extrabold leading-none tracking-tight">
          <span className="bg-gradient-to-b from-sky-400 to-blue-700 bg-clip-text text-transparent">Nha</span>
          <span className="bg-gradient-to-b from-slate-400 to-slate-600 bg-clip-text text-transparent dark:from-slate-200 dark:to-slate-400">Pilot</span>
        </span>
      )}
    </span>
  );
}
