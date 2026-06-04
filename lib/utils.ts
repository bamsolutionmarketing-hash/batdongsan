// Minimal class combiner (shadcn-style `cn`) without extra deps.
type ClassValue = string | false | null | undefined;
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
