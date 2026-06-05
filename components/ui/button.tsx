import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-sky-600 text-white shadow-sm shadow-sky-950/40 hover:bg-sky-500",
  outline: "border border-slate-700 text-slate-200 hover:border-slate-500 hover:bg-slate-800/40",
  ghost: "text-slate-300 hover:text-white hover:bg-slate-800",
};
const BASE =
  "inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none";

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={cn(BASE, VARIANTS[variant], className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: React.ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={cn(BASE, VARIANTS[variant], className)} {...props} />;
}
