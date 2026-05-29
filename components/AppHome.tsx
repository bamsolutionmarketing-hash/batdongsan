"use client";

import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectExplorer } from "@/components/map/ProjectExplorer";
import { normalizeText } from "@/lib/filter/filter";
import type { Project } from "@/lib/data/types";

type View = "grid" | "map";

// Front door: pick a project to sell. Search-first card grid by default; the
// relationship map is a secondary "Khám phá" view.
export function AppHome({
  projects,
  slugById,
}: {
  projects: Project[];
  slugById: Record<string, string>;
}) {
  const [view, setView] = useState<View>("grid");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = normalizeText(query);
    if (!q) return projects;
    return projects.filter((p) =>
      [p.name, p.developer, p.district].some((f) => normalizeText(f).includes(q)),
    );
  }, [projects, query]);

  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
        Chưa có dự án nào. Quản trị viên hãy nạp tài liệu hoặc thêm dự án để bắt đầu.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm dự án để bán…"
          className="w-full max-w-sm rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm outline-none placeholder:text-slate-500 focus:border-sky-500"
        />
        <div className="flex rounded-md border border-slate-700 p-0.5 text-xs">
          <button
            onClick={() => setView("grid")}
            className={`rounded px-3 py-1.5 ${view === "grid" ? "bg-sky-600 text-white" : "text-slate-300"}`}
          >
            Danh sách
          </button>
          <button
            onClick={() => setView("map")}
            className={`rounded px-3 py-1.5 ${view === "map" ? "bg-sky-600 text-white" : "text-slate-300"}`}
          >
            Khám phá (bản đồ)
          </button>
        </div>
      </div>

      {view === "grid" ? (
        filtered.length === 0 ? (
          <p className="text-sm text-slate-500">Không có dự án khớp “{query}”.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} slug={slugById[p.id] ?? ""} />
            ))}
          </div>
        )
      ) : (
        <ProjectExplorer projects={projects} slugById={slugById} />
      )}
    </div>
  );
}
