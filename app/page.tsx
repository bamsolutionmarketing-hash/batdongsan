"use client";

import { useMemo, useState } from "react";
import { ForceGraph } from "@/components/map/ForceGraph";
import { GuidancePanel } from "@/components/map/GuidancePanel";
import { FilterBar } from "@/components/map/FilterBar";
import { seedProjects } from "@/lib/data/seed";
import { toGraphData } from "@/lib/map/transform";
import { buildGuidance } from "@/lib/engine/guidance";
import { applyFilters, collectFacets, type FilterCriteria } from "@/lib/filter/filter";

export default function Home() {
  const facets = useMemo(() => collectFacets(seedProjects), []);
  const [criteria, setCriteria] = useState<FilterCriteria>({});
  const [selectedId, setSelectedId] = useState(seedProjects[0].id);

  const { visible, highlightIds } = useMemo(
    () => applyFilters(seedProjects, criteria),
    [criteria],
  );
  const graph = useMemo(() => toGraphData(visible), [visible]);
  const searching = Boolean(criteria.query?.trim());

  // Keep guidance on a project that is still visible.
  const selected =
    visible.find((p) => p.id === selectedId) ?? visible[0] ?? seedProjects[0];
  const guidance = useMemo(() => buildGuidance(selected, seedProjects), [selected]);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">Bản đồ dự án BĐS</h1>
        <p className="text-sm text-slate-400">
          Lọc theo phân khúc / khu vực / chủ đầu tư / trạng thái, hoặc tìm theo tên. Chọn một node để
          xem guidance.
        </p>
      </header>

      <FilterBar
        facets={facets}
        criteria={criteria}
        onChange={setCriteria}
        resultCount={visible.length}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <ForceGraph
          data={graph}
          selectedId={selected.id}
          highlightIds={highlightIds}
          searching={searching}
          onSelect={setSelectedId}
        />
        <GuidancePanel result={guidance} title={selected.name} />
      </div>
    </main>
  );
}
