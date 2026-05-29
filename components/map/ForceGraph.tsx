"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GraphData, LinkReason, Segment } from "@/lib/data/types";
import { buildAdjacency, neighborhood, pairKey } from "@/lib/map/adjacency";

// react-force-graph-2d touches `window`, so it must load client-side only.
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

const SEGMENT_COLOR: Record<Segment, string> = {
  luxury: "#f59e0b",
  "high-end": "#38bdf8",
  "mid-range": "#34d399",
  affordable: "#a78bfa",
};

// Each relationship type gets its own hue so the map is legible at a glance.
const LINK_COLOR: Record<LinkReason, string> = {
  related: "#f472b6",
  "same-developer": "#38bdf8",
  "same-district": "#34d399",
  "same-segment": "#94a3b8",
};

const DIM_NODE = "rgba(100,116,139,0.18)";
const DIM_LINK = "rgba(100,116,139,0.07)";
const DIM_TEXT = "rgba(148,163,184,0.35)";

interface ForceGraphProps {
  data: GraphData;
  selectedId?: string;
  /** Ids matching the active text search; others are dimmed while searching. */
  highlightIds?: string[];
  searching?: boolean;
  onSelect?: (id: string) => void;
}

function linkEnd(end: string | { id: string }): string {
  return typeof end === "string" ? end : end.id;
}

export function ForceGraph({ data, selectedId, highlightIds, searching, onSelect }: ForceGraphProps) {
  const fgRef = useRef<any>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  // Clone so the lib can mutate node positions without touching our state.
  const graph = useMemo(
    () => ({ nodes: data.nodes.map((n) => ({ ...n })), links: data.links.map((l) => ({ ...l })) }),
    [data],
  );

  const adj = useMemo(() => buildAdjacency(data), [data]);
  const searchSet = useMemo(() => new Set(highlightIds ?? []), [highlightIds]);

  // The active focus: hover wins, else the selected node.
  const focusId = hoverId ?? selectedId ?? null;
  const focusHood = useMemo(() => neighborhood(adj, focusId), [adj, focusId]);

  // Fit the whole graph in view once it settles, and whenever the data changes.
  const handleEngineStop = useCallback(() => {
    fgRef.current?.zoomToFit(400, 60);
  }, []);
  useEffect(() => {
    const t = setTimeout(() => fgRef.current?.zoomToFit(400, 60), 300);
    return () => clearTimeout(t);
  }, [graph]);

  // Is this node "active" (full-strength) given search + focus state?
  const nodeActive = useCallback(
    (id: string): boolean => {
      if (searching && !searchSet.has(id)) return false;
      if (focusId && !focusHood.has(id)) return false;
      return true;
    },
    [searching, searchSet, focusId, focusHood],
  );

  return (
    <div className="relative h-[560px] w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
      <ForceGraph2D
        ref={fgRef}
        graphData={graph}
        nodeId="id"
        nodeVal="val"
        nodeRelSize={5}
        cooldownTicks={120}
        onEngineStop={handleEngineStop}
        nodeLabel={() => ""}
        onNodeHover={(n: any) => setHoverId(n ? n.id : null)}
        onNodeClick={(n: any) => onSelect?.(n.id)}
        onBackgroundClick={() => onSelect?.("")}
        linkColor={(l: any) => {
          const s = linkEnd(l.source);
          const t = linkEnd(l.target);
          const active = !focusId || (focusHood.has(s) && focusHood.has(t));
          const searchOk = !searching || (searchSet.has(s) && searchSet.has(t));
          return active && searchOk ? LINK_COLOR[l.reason as LinkReason] : DIM_LINK;
        }}
        linkWidth={(l: any) => {
          const focused =
            focusId && focusHood.has(linkEnd(l.source)) && focusHood.has(linkEnd(l.target));
          return focused ? 2.5 : 1;
        }}
        linkDirectionalParticles={0}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, scale: number) => {
          const active = nodeActive(node.id);
          const radius = Math.max(2, node.val) * (active ? 1 : 0.85);
          const isFocus = node.id === focusId;
          const isSelected = node.id === selectedId;

          // Node circle.
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
          ctx.fillStyle = active ? SEGMENT_COLOR[node.segment as Segment] : DIM_NODE;
          ctx.fill();

          // Ring around the focused / selected node.
          if (isFocus || isSelected) {
            ctx.lineWidth = 1.5 / scale;
            ctx.strokeStyle = isSelected ? "#ffffff" : "rgba(255,255,255,0.7)";
            ctx.stroke();
          }

          // Label culling: show labels only when zoomed in, for the focused
          // neighborhood, or for hubs — so thousands of nodes stay readable.
          const showLabel = active && (scale > 1.6 || isFocus || focusHood.has(node.id) || node.degree >= 4);
          if (showLabel) {
            const label = node.label as string;
            const fontSize = Math.max(2.5, 11 / scale);
            ctx.font = `${fontSize}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillStyle = active ? "#e2e8f0" : DIM_TEXT;
            ctx.fillText(label, node.x, node.y + radius + 1.5);
          }
        }}
        nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
          ctx.beginPath();
          ctx.arc(node.x, node.y, Math.max(4, node.val + 2), 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }}
      />

      <Legend />
    </div>
  );
}

function Legend() {
  const items: { label: string; color: string }[] = [
    { label: "Cùng chủ đầu tư", color: LINK_COLOR["same-developer"] },
    { label: "Cùng khu vực", color: LINK_COLOR["same-district"] },
    { label: "Cùng phân khúc", color: LINK_COLOR["same-segment"] },
    { label: "Liên quan", color: LINK_COLOR["related"] },
  ];
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 flex flex-col gap-1 rounded-md bg-slate-950/70 p-2 text-[10px] text-slate-300 backdrop-blur">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded" style={{ backgroundColor: it.color }} />
          {it.label}
        </div>
      ))}
    </div>
  );
}
