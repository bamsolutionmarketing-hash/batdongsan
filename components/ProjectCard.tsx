import Link from "next/link";
import type { Project, Segment, ProjectStatus } from "@/lib/data/types";

const SEGMENT_VI: Record<Segment, string> = {
  luxury: "Hạng sang",
  "high-end": "Cao cấp",
  "mid-range": "Trung cấp",
  affordable: "Bình dân",
};
const STATUS_VI: Record<ProjectStatus, string> = {
  planning: "Quy hoạch",
  selling: "Mở bán",
  handover: "Bàn giao",
  completed: "Hoàn thành",
};

// Front-door card: pick a project -> straight into everything you need to sell it.
export function ProjectCard({ project, slug }: { project: Project; slug: string }) {
  return (
    <Link
      href={`/p/${slug}`}
      className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900 p-4 transition-colors hover:border-sky-600"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-100">{project.name}</h3>
        <span className="whitespace-nowrap rounded-full border border-slate-700 px-2 py-0.5 text-[10px] text-slate-400">
          {STATUS_VI[project.status]}
        </span>
      </div>
      <p className="text-xs text-slate-400">
        {project.developer && `${project.developer} · `}
        {project.district}
      </p>
      <div className="mt-1 flex items-center justify-between text-xs">
        <span className="text-slate-300">
          {project.pricePerSqmM > 0 ? `${project.pricePerSqmM} tr/m²` : "—"}
        </span>
        <span className="text-slate-500">{SEGMENT_VI[project.segment]}</span>
      </div>
      <span className="mt-2 text-xs font-medium text-sky-400">Mở để bán ngay →</span>
    </Link>
  );
}
