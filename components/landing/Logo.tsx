/* eslint-disable @next/next/no-img-element */
// Brand mark for NhaPilot: the NP monogram (public/brand/mark.svg) + an optional
// "NhaPilot" wordmark (blue Nha / silver Pilot).

export function BrandIcon({ className = "h-8 w-8" }: { className?: string }) {
  return <img src="/brand/mark.svg" alt="NhaPilot" className={`shrink-0 object-contain ${className}`} />;
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
