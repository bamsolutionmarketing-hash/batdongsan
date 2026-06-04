"use client";

import { useMemo, useState } from "react";
import { ForceGraph } from "./ForceGraph";
import { NODE_KIND_COLORS, NODE_KIND_LABEL, EDGE_KIND_COLORS } from "@/lib/map/project-graph";
import type { GraphData } from "@/lib/data/types";

// Read-only per-project knowledge map. Node colour = concept kind; clicking a
// node shows its note. Reuses the Obsidian-grade ForceGraph with a concept
// palette + legend.
export function ProjectKnowledgeMap({
  data,
  notesById,
}: {
  data: GraphData;
  notesById?: Record<string, { label: string; kind: string; note: string | null }>;
}) {
  const [selectedId, setSelectedId] = useState<string>("");

  const legend = useMemo(
    () =>
      Array.from(new Set(data.nodes.map((n) => n.group))).map((kind) => ({
        label: NODE_KIND_LABEL[kind] ?? kind,
        color: NODE_KIND_COLORS[kind] ?? "#64748b",
      })),
    [data],
  );

  const selected = selectedId ? notesById?.[selectedId] : undefined;

  if (data.nodes.length === 0) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-center text-sm text-slate-400">
        Dự án chưa có bản đồ tri thức. Quản trị viên có thể tạo trong trang chỉnh sửa.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ForceGraph
        data={data}
        selectedId={selectedId}
        onSelect={setSelectedId}
        nodeColors={NODE_KIND_COLORS}
        linkColors={EDGE_KIND_COLORS}
        legend={legend}
      />
      {selected && (
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">
            {NODE_KIND_LABEL[selected.kind] ?? selected.kind}
          </p>
          <h3 className="text-sm font-semibold text-slate-100">{selected.label}</h3>
          {selected.note && (
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-300">
              {selected.note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
