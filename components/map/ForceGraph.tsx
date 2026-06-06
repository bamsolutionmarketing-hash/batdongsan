"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GraphData } from "@/lib/data/types";
import { buildAdjacency, neighborhood } from "@/lib/map/adjacency";

// react-force-graph-2d touches `window`, so it must load client-side only.
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

// Default palette for the cross-project map (group = segment / relation type).
// Per-project knowledge graphs pass their own palette + legend via props.
const DEFAULT_NODE_COLORS: Record<string, string> = {
  luxury: "#f59e0b",
  "high-end": "#38bdf8",
  "mid-range": "#34d399",
  affordable: "#a78bfa",
};

const DEFAULT_LINK_COLORS: Record<string, string> = {
  related: "#f472b6",
  "same-developer": "#38bdf8",
  "same-district": "#34d399",
  "same-segment": "#94a3b8",
};

const DEFAULT_LEGEND: LegendItem[] = [
  { label: "Cùng chủ đầu tư", color: DEFAULT_LINK_COLORS["same-developer"] },
  { label: "Cùng khu vực", color: DEFAULT_LINK_COLORS["same-district"] },
  { label: "Cùng phân khúc", color: DEFAULT_LINK_COLORS["same-segment"] },
  { label: "Liên quan", color: DEFAULT_LINK_COLORS["related"] },
];

const FALLBACK_NODE = "#64748b";
const FALLBACK_LINK = "rgba(148,163,184,0.4)";
const DIM_NODE = "rgba(100,116,139,0.18)";
const DIM_LINK = "rgba(100,116,139,0.07)";
const DIM_TEXT = "rgba(148,163,184,0.35)";

interface LegendItem {
  label: string;
  color: string;
}

interface ForceGraphProps {
  data: GraphData;
  selectedId?: string;
  /** Ids matching the active text search; others are dimmed while searching. */
  highlightIds?: string[];
  searching?: boolean;
  onSelect?: (id: string) => void;
  /** Selection mode: click toggles membership in `selectedIds` (max maxSelect). */
  mode?: "view" | "select";
  selectedIds?: string[];
  onToggle?: (id: string) => void;
  /** group -> node colour. Falls back to the cross-project palette. */
  nodeColors?: Record<string, string>;
  /** group -> link colour. */
  linkColors?: Record<string, string>;
  /** Legend rows; pass [] to hide. */
  legend?: LegendItem[];
  /** Teaser tuning: extra zoom after fit, padding, and always-on labels. */
  fitPadding?: number;
  zoomBoost?: number;
  alwaysLabels?: boolean;
}

function linkEnd(end: string | { id: string }): string {
  return typeof end === "string" ? end : end.id;
}

export function ForceGraph({
  data,
  selectedId,
  highlightIds,
  searching,
  onSelect,
  mode = "view",
  selectedIds,
  onToggle,
  nodeColors = DEFAULT_NODE_COLORS,
  linkColors = DEFAULT_LINK_COLORS,
  legend = DEFAULT_LEGEND,
  fitPadding = 60,
  zoomBoost = 1,
  alwaysLabels = false,
}: ForceGraphProps) {
  const fgRef = useRef<any>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const pickedSet = useMemo(() => new Set(selectedIds ?? []), [selectedIds]);

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
  // Optionally zoom in past the fit (teaser) so nodes are large & tappable.
  const fit = useCallback(() => {
    fgRef.current?.zoomToFit(400, fitPadding);
    if (zoomBoost !== 1) {
      setTimeout(() => {
        const z = fgRef.current?.zoom?.();
        if (z) fgRef.current.zoom(z * zoomBoost, 400);
      }, 450);
    }
  }, [fitPadding, zoomBoost]);
  const handleEngineStop = useCallback(() => fit(), [fit]);
  useEffect(() => {
    const t = setTimeout(fit, 300);
    return () => clearTimeout(t);
  }, [graph, fit]);

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
    <div className="relative h-[60vh] min-h-[380px] w-full overflow-hidden rounded-lg border border-border bg-card sm:h-[560px]">
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
        onNodeClick={(n: any) => (mode === "select" ? onToggle?.(n.id) : onSelect?.(n.id))}
        onBackgroundClick={() => onSelect?.("")}
        linkColor={(l: any) => {
          const s = linkEnd(l.source);
          const t = linkEnd(l.target);
          const active = !focusId || (focusHood.has(s) && focusHood.has(t));
          const searchOk = !searching || (searchSet.has(s) && searchSet.has(t));
          return active && searchOk ? (linkColors[l.group] ?? FALLBACK_LINK) : DIM_LINK;
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
          const isPicked = pickedSet.has(node.id);

          // Node circle.
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
          ctx.fillStyle = active ? (nodeColors[node.group] ?? FALLBACK_NODE) : DIM_NODE;
          ctx.fill();

          // Gold ring + check badge for picked nodes (selection mode).
          if (isPicked) {
            ctx.lineWidth = 2.5 / scale;
            ctx.strokeStyle = "#fbbf24";
            ctx.stroke();
            const badge = Math.max(2, 6 / scale);
            ctx.beginPath();
            ctx.arc(node.x + radius, node.y - radius, badge, 0, 2 * Math.PI);
            ctx.fillStyle = "#fbbf24";
            ctx.fill();
            ctx.fillStyle = "#0f172a";
            ctx.font = `bold ${badge * 1.3}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("✓", node.x + radius, node.y - radius);
          } else if (isFocus || isSelected) {
            ctx.lineWidth = 1.5 / scale;
            ctx.strokeStyle = isSelected ? "#ffffff" : "rgba(255,255,255,0.7)";
            ctx.stroke();
          }

          // Label culling: show labels only when zoomed in, for the focused
          // neighborhood, or for hubs — so thousands of nodes stay readable.
          const showLabel = active && (alwaysLabels || scale > 1.6 || isFocus || focusHood.has(node.id) || node.degree >= 4);
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

      {legend.length > 0 && <Legend items={legend} />}
    </div>
  );
}

function Legend({ items }: { items: LegendItem[] }) {
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 flex flex-col gap-1 rounded-md bg-background/70 p-2 text-[10px] text-foreground backdrop-blur">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded" style={{ backgroundColor: it.color }} />
          {it.label}
        </div>
      ))}
    </div>
  );
}
