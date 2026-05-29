"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { GraphData, Segment } from "@/lib/data/types";

// react-force-graph-2d touches `window`, so it must load client-side only.
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

const SEGMENT_COLOR: Record<Segment, string> = {
  luxury: "#f59e0b",
  "high-end": "#38bdf8",
  "mid-range": "#34d399",
  affordable: "#a78bfa",
};

const DIM_COLOR = "rgba(100,116,139,0.25)";

interface ForceGraphProps {
  data: GraphData;
  selectedId?: string;
  /** Ids matching the active text search; others are dimmed while searching. */
  highlightIds?: string[];
  searching?: boolean;
  onSelect?: (id: string) => void;
}

export function ForceGraph({ data, selectedId, highlightIds, searching, onSelect }: ForceGraphProps) {
  // Clone so the lib can mutate node positions without touching our state.
  const graph = useMemo(
    () => ({ nodes: data.nodes.map((n) => ({ ...n })), links: data.links.map((l) => ({ ...l })) }),
    [data],
  );

  const highlightSet = useMemo(() => new Set(highlightIds ?? []), [highlightIds]);

  const colorFor = (id: string, segment: Segment): string => {
    if (id === selectedId) return "#ffffff";
    if (searching && !highlightSet.has(id)) return DIM_COLOR;
    return SEGMENT_COLOR[segment];
  };

  return (
    <div className="h-[560px] w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
      <ForceGraph2D
        graphData={graph}
        nodeId="id"
        nodeVal="val"
        nodeLabel={(n: any) => n.label}
        nodeColor={(n: any) => colorFor(n.id, n.segment as Segment)}
        linkColor={() => "rgba(148,163,184,0.4)"}
        linkWidth={1.2}
        onNodeClick={(n: any) => onSelect?.(n.id)}
        nodeCanvasObjectMode={() => "after"}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, scale: number) => {
          const label = node.label as string;
          const dimmed = searching && !highlightSet.has(node.id) && node.id !== selectedId;
          ctx.font = `${12 / scale}px sans-serif`;
          ctx.fillStyle = dimmed ? DIM_COLOR : "#e2e8f0";
          ctx.textAlign = "center";
          ctx.fillText(label, node.x, node.y + 10);
        }}
      />
    </div>
  );
}
