"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ForceGraph } from "./ForceGraph";
import { NODE_KIND_COLORS, NODE_KIND_LABEL, EDGE_KIND_COLORS } from "@/lib/map/project-graph";
import { cohesion, getAngle } from "@/lib/script-engine/data/angles";
import { createPost } from "@/app/(app)/projects/_actions";
import type { GraphData } from "@/lib/data/types";

type Notes = Record<string, { label: string; kind: string; note: string | null }>;

const MAX = 4;

// Selection-mode map: pick ≤4 nodes → "Tạo bài (n)" → createPost.
export function MapSelection({
  projectId,
  slug,
  data,
  notesById,
}: {
  projectId: string;
  slug: string;
  data: GraphData;
  notesById: Notes;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const legend = useMemo(
    () =>
      Array.from(new Set(data.nodes.map((n) => n.group))).map((kind) => ({
        label: NODE_KIND_LABEL[kind] ?? kind,
        color: NODE_KIND_COLORS[kind] ?? "#64748b",
      })),
    [data],
  );

  const toggle = (id: string) =>
    setSelected((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : cur.length < MAX ? [...cur, id] : cur,
    );

  // Live coherence check (đồng nhất): score the picked points against their
  // dominant theme so we can warn — while selecting — when they scatter across
  // unrelated topics (the "nhảy chủ đề" problem). Agent decides what to do.
  const coh = useMemo(() => {
    const nodes = selected.map((id) => ({ label: notesById[id]?.label ?? id, category: notesById[id]?.kind }));
    const dominant = cohesion(null, nodes).suggestedAngleId;
    return { ...cohesion(dominant, nodes), dominant };
  }, [selected, notesById]);
  const scattered = selected.length >= 2 && coh.score < 70 && coh.offTopic.length > 0;

  const submit = () =>
    startTransition(() => {
      void createPost(projectId, slug, selected);
    });

  return (
    <div className="flex flex-col gap-3">
      <ForceGraph
        data={data}
        mode="select"
        selectedIds={selected}
        onToggle={toggle}
        nodeColors={NODE_KIND_COLORS}
        linkColors={EDGE_KIND_COLORS}
        legend={legend}
      />

      <div className="sticky bottom-20 z-30 flex flex-col gap-2 rounded-lg border border-border bg-card/95 p-3 backdrop-blur sm:bottom-3">
        {scattered && (
          <p className="text-xs text-amber-300">
            ⚠ {coh.offTopic.length} điểm lệch chủ đề chính{getAngle(coh.dominant)?.short ? ` “${getAngle(coh.dominant)!.short}”` : ""}
            {` (${coh.offTopic.join(", ")})`} — video dễ rời rạc. Nên bỏ bớt điểm lệch hoặc tách thành 2 video để mạch chặt hơn.
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {selected.length === 0 ? (
            <span className="text-sm text-muted-foreground">Chạm vào điểm trên bản đồ để chọn (tối đa {MAX}).</span>
          ) : (
            selected.map((id) => (
              <button
                key={id}
                onClick={() => toggle(id)}
                className="flex items-center gap-1 rounded-full border border-amber-700/60 bg-amber-950/30 px-3 py-1 text-xs text-amber-200 hover:border-amber-500"
              >
                {notesById[id]?.label ?? id} <span className="text-amber-400">✕</span>
              </button>
            ))
          )}
          <div className="ml-auto flex gap-2">
          <button
            onClick={() => router.push(`/scripts?project=${projectId}&nodes=${selected.join(",")}`)}
            disabled={selected.length === 0}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-foreground/40 disabled:opacity-50"
          >
            🎬 Tạo video ({selected.length})
          </button>
          <button
            onClick={submit}
            disabled={selected.length === 0 || pending}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
          >
            {pending ? "Đang tạo…" : `📄 Tạo bài viết (${selected.length})`}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
