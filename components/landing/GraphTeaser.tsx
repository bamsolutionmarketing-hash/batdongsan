"use client";

import { useState } from "react";
import { ForceGraph } from "@/components/map/ForceGraph";
import { NODE_KIND_COLORS, NODE_KIND_LABEL, EDGE_KIND_COLORS } from "@/lib/map/project-graph";
import { SAMPLE_GRAPH } from "@/lib/landing/sample";

const LEGEND = Array.from(new Set(SAMPLE_GRAPH.nodes.map((n) => n.group))).map((g) => ({
  label: NODE_KIND_LABEL[g] ?? g,
  color: NODE_KIND_COLORS[g] ?? "#64748b",
}));

// A live mini knowledge-graph — tap nodes to "pick points", just like the app.
export function GraphTeaser() {
  const [picked, setPicked] = useState<string[]>(["gladia"]);
  const toggle = (id: string) =>
    setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length < 4 ? [...cur, id] : cur));

  return (
    <div className="flex flex-col gap-2">
      <ForceGraph
        data={SAMPLE_GRAPH}
        mode="select"
        selectedIds={picked}
        onToggle={toggle}
        nodeColors={NODE_KIND_COLORS}
        linkColors={EDGE_KIND_COLORS}
        legend={LEGEND}
      />
      <p className="text-center text-xs text-slate-500">
        Chạm vào điểm để chọn (đang chọn {picked.length}/4) — đây chính là cách bạn dựng bài trong app.
      </p>
    </div>
  );
}
