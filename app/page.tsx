"use client";

import { useMemo, useState } from "react";
import { ForceGraph } from "@/components/map/ForceGraph";
import { GuidancePanel } from "@/components/map/GuidancePanel";
import { seedProjects } from "@/lib/data/seed";
import { toGraphData } from "@/lib/map/transform";
import { buildGuidance } from "@/lib/engine/guidance";

export default function Home() {
  const graph = useMemo(() => toGraphData(seedProjects), []);
  const [selectedId, setSelectedId] = useState(seedProjects[0].id);

  const selected = seedProjects.find((p) => p.id === selectedId) ?? seedProjects[0];
  const guidance = useMemo(() => buildGuidance(selected, seedProjects), [selected]);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">Bản đồ dự án BĐS</h1>
        <p className="text-sm text-slate-400">
          Chọn một node trên bản đồ để xem guidance. Màu node theo phân khúc; cạnh nối thể hiện quan hệ
          (cùng chủ đầu tư / khu vực / phân khúc / liên quan).
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <ForceGraph data={graph} selectedId={selectedId} onSelect={setSelectedId} />
        <GuidancePanel result={guidance} title={selected.name} />
      </div>
    </main>
  );
}
