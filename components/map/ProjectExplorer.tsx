"use client";

import { useMemo, useState } from "react";
import { ForceGraph } from "@/components/map/ForceGraph";
import { GuidancePanel } from "@/components/map/GuidancePanel";
import { FilterBar } from "@/components/map/FilterBar";
import { toGraphData } from "@/lib/map/transform";
import { buildGuidance } from "@/lib/engine/guidance";
import { applyFilters, collectFacets, type FilterCriteria } from "@/lib/filter/filter";
import type { Project } from "@/lib/data/types";

// Map + filter + guidance over an arbitrary project list (seed or DB-backed).
export function ProjectExplorer({ projects }: { projects: Project[] }) {
  const facets = useMemo(() => collectFacets(projects), [projects]);
  const [criteria, setCriteria] = useState<FilterCriteria>({});
  const [selectedId, setSelectedId] = useState<string | null>(projects[0]?.id ?? null);

  const { visible, highlightIds } = useMemo(
    () => applyFilters(projects, criteria),
    [projects, criteria],
  );
  const graph = useMemo(() => toGraphData(visible), [visible]);
  const searching = Boolean(criteria.query?.trim());

  const selected =
    visible.find((p) => p.id === selectedId) ?? visible[0] ?? projects[0] ?? null;
  const guidance = useMemo(
    () => (selected ? buildGuidance(selected, projects) : null),
    [selected, projects],
  );

  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
        Chưa có dự án nào. Quản trị viên hãy thêm dự án để bắt đầu.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <FilterBar
        facets={facets}
        criteria={criteria}
        onChange={setCriteria}
        resultCount={visible.length}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <ForceGraph
          data={graph}
          selectedId={selected?.id}
          highlightIds={highlightIds}
          searching={searching}
          onSelect={setSelectedId}
        />
        {guidance && selected && <GuidancePanel result={guidance} title={selected.name} />}
      </div>
    </div>
  );
}
