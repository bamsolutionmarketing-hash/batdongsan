import Link from "next/link";
import { listPublishedProjects } from "@/lib/repo/projects";

// Public landing — lists published projects (RLS shows demo projects to anon).
// Each card links into the project's knowledge map.
export default async function Home() {
  const res = await listPublishedProjects();
  const projects = res.ok ? res.data : [];

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Bản đồ tri thức dự án BĐS</h1>
          <p className="text-sm text-slate-400">
            Mở một dự án → khám phá bản đồ tri thức. Đăng nhập để tạo nội dung bán hàng.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/contact"
            className="whitespace-nowrap rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:border-slate-500"
          >
            Đăng ký cho team
          </Link>
          <Link
            href="/login"
            className="whitespace-nowrap rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500"
          >
            Đăng nhập
          </Link>
        </div>
      </header>

      {projects.length === 0 ? (
        <p className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-center text-sm text-slate-400">
          Chưa có dự án công khai.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/p/${p.slug}`}
              className="group rounded-lg border border-slate-800 bg-slate-900 p-5 shadow-sm shadow-slate-950/40 transition hover:-translate-y-0.5 hover:border-slate-600 hover:shadow-lg hover:shadow-slate-950/60"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-100 group-hover:text-white">{p.name}</h2>
                {p.phase && (
                  <span className="shrink-0 rounded-full border border-amber-700/50 bg-amber-950/30 px-2 py-0.5 text-[11px] text-amber-300">{p.phase}</span>
                )}
              </div>
              {p.locationText && (
                <p className="mt-1 text-sm text-slate-400">{p.locationText}</p>
              )}
              {(p.priceMin || p.priceMax) && (
                <p className="mt-3 text-sm font-medium text-sky-300">{priceLabel(p.priceMin, p.priceMax)}</p>
              )}
              <span className="mt-3 inline-flex items-center gap-1 text-xs text-slate-500 transition group-hover:text-sky-400">Mở bản đồ →</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

// VND/m² (bigint) → "x–y tr/m²".
function priceLabel(min: number | null, max: number | null): string {
  const m = (v: number) => Math.round(v / 1_000_000);
  if (min && max) return `${m(min)}–${m(max)} tr/m²`;
  if (min) return `từ ${m(min)} tr/m²`;
  if (max) return `đến ${m(max)} tr/m²`;
  return "";
}
