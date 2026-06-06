// Brand mark for NhaPilot — a dark monogram tile (blue "N" peak + silver "P" +
// paper-plane accent) with an optional "NhaPilot" wordmark (blue Nha / silver
// Pilot). Recreated in SVG/CSS so it scales crisply and is theme-aware.

export function BrandIcon({ className = "" }: { className?: string }) {
  return (
    <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-[28%] bg-gradient-to-br from-slate-800 to-slate-950 ring-1 ring-sky-400/40 shadow-[0_6px_16px_-6px_rgba(56,130,246,0.6)] ${className}`}>
      <svg viewBox="0 0 48 48" className="h-[76%] w-[76%]" fill="none" aria-hidden>
        <defs>
          <linearGradient id="np-blue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7dd3fc" />
            <stop offset="1" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="np-silver" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f1f5f9" />
            <stop offset="1" stopColor="#64748b" />
          </linearGradient>
        </defs>
        {/* N as an ascending roof/peak */}
        <path d="M8 39 V13 L22 33 V13" stroke="url(#np-blue)" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />
        {/* P */}
        <path d="M29 39 V11 h6.5 a6.5 6.5 0 0 1 0 13 H29" stroke="url(#np-silver)" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />
        {/* paper-plane accent */}
        <path d="M22.5 19 l9 4.2 -3.4 1.2 -1.2 3.6 z" fill="url(#np-blue)" />
      </svg>
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
