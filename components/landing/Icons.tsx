// Line-art icons for the landing features. Match the title's intent, not just
// the emoji it replaces — single-stroke, neutral, theme-aware (currentColor).
// 24×24 viewBox, stroke 1.6.

type P = { className?: string };
const wrap = (className?: string) => `h-5 w-5 ${className ?? ""}`;
const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

// Knowledge map — connected nodes
export function IconMap({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={wrap(className)} {...S}>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="12" cy="13" r="2.4" />
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="19" r="2" />
      <path d="M7.6 7.2 10.4 12M16.4 7.2 13.6 12M10.6 14.7 7.4 17.4M13.4 14.7l3.2 2.7" />
    </svg>
  );
}

// Today — sun rising on a horizon
export function IconSun({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={wrap(className)} {...S}>
      <circle cx="12" cy="13" r="3.5" />
      <path d="M12 5v2M5 13H3M21 13h-2M6.4 7.4 5 6M17.6 7.4 19 6M3 18h18" />
    </svg>
  );
}

// Verified data — shield with check
export function IconShield({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={wrap(className)} {...S}>
      <path d="M12 3 4 6v6c0 4.5 3.4 7.7 8 9 4.6-1.3 8-4.5 8-9V6l-8-3Z" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </svg>
  );
}

// AI prompt — sparkles
export function IconSparkles({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={wrap(className)} {...S}>
      <path d="M12 4v3M12 17v3M5 12H2M22 12h-3M6.5 6.5 8 8M16 16l1.5 1.5M6.5 17.5 8 16M16 8l1.5-1.5" />
      <path d="M12 9c.7 1.6 1.4 2.3 3 3-1.6.7-2.3 1.4-3 3-.7-1.6-1.4-2.3-3-3 1.6-.7 2.3-1.4 3-3Z" />
    </svg>
  );
}

// Branded image — picture frame with watermark dot
export function IconImage({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={wrap(className)} {...S}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="m4 16 5-5 4 4 3-2 4 4" />
      <circle cx="9" cy="9" r="1.4" />
      <circle cx="17.5" cy="17.5" r="1.2" />
    </svg>
  );
}

// Calendar — grid with marker
export function IconCalendar({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={wrap(className)} {...S}>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3.5v4M16 3.5v4" />
      <rect x="11" y="13" width="3" height="3" rx="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export type IconKey = "map" | "sun" | "shield" | "sparkles" | "image" | "calendar";
export const ICONS: Record<IconKey, (p: P) => JSX.Element> = {
  map: IconMap, sun: IconSun, shield: IconShield,
  sparkles: IconSparkles, image: IconImage, calendar: IconCalendar,
};
