"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ProjectKnowledgeMap } from "@/components/map/ProjectKnowledgeMap";
import { NODE_KIND_LABEL } from "@/lib/map/project-graph";
import type { GraphData } from "@/lib/data/types";
import type { MapNodeRow, MapEdgeRow } from "@/lib/map/project-graph";
import { addNode, deleteNode, addEdge, deleteEdge, type MapEditState } from "./actions";

const NODE_KINDS = Object.keys(NODE_KIND_LABEL);
const EDGE_KINDS: Record<string, string> = {
  relates: "Liên quan",
  part_of: "Thuộc về",
  near: "Gần",
  supports: "Hỗ trợ",
};

const input =
  "rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm outline-none focus:border-sky-500";

export function MapEditor({
  slug,
  graph,
  notesById,
  nodes,
  edges,
}: {
  slug: string;
  graph: GraphData;
  notesById: Record<string, { label: string; kind: string; note: string | null }>;
  nodes: MapNodeRow[];
  edges: MapEdgeRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function run(action: (p: MapEditState, fd: FormData) => Promise<MapEditState>, fd: FormData) {
    setError(undefined);
    fd.set("slug", slug);
    startTransition(async () => {
      const res = await action({}, fd);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  const labelOf = (id: string) => notesById[id]?.label ?? id;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
      {/* Left: editing forms + lists */}
      <div className="flex flex-col gap-5">
        {error && <p className="text-sm text-red-400">{error}</p>}

        {/* Add node */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(addNode, new FormData(e.currentTarget));
            e.currentTarget.reset();
          }}
          className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900 p-4"
        >
          <h2 className="text-sm font-semibold">Thêm node</h2>
          <input name="label" required placeholder="Nội dung (vd: Hồ bơi vô cực)" className={input} />
          <div className="flex gap-2">
            <select name="kind" className={`${input} flex-1`} defaultValue="concept">
              {NODE_KINDS.map((k) => (
                <option key={k} value={k}>
                  {NODE_KIND_LABEL[k]}
                </option>
              ))}
            </select>
          </div>
          <textarea name="note" rows={2} placeholder="Ghi chú (tuỳ chọn)" className={input} />
          <button
            disabled={pending}
            className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
          >
            Thêm node
          </button>
        </form>

        {/* Add edge */}
        {nodes.length >= 2 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(addEdge, new FormData(e.currentTarget));
            }}
            className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900 p-4"
          >
            <h2 className="text-sm font-semibold">Nối 2 node</h2>
            <select name="sourceId" required className={input} defaultValue="">
              <option value="" disabled>
                Từ node…
              </option>
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
            <select name="targetId" required className={input} defaultValue="">
              <option value="" disabled>
                Đến node…
              </option>
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
            <select name="kind" className={input} defaultValue="relates">
              {Object.entries(EDGE_KINDS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <button
              disabled={pending}
              className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
            >
              Nối
            </button>
          </form>
        )}

        {/* Node list */}
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <h2 className="mb-2 text-sm font-semibold">Node ({nodes.length})</h2>
          <ul className="flex flex-col gap-1">
            {nodes.map((n) => (
              <li key={n.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate">
                  <span className="text-slate-500">{NODE_KIND_LABEL[n.kind] ?? n.kind}: </span>
                  {n.label}
                </span>
                <button
                  onClick={() => {
                    const fd = new FormData();
                    fd.set("nodeId", n.id);
                    run(deleteNode, fd);
                  }}
                  className="shrink-0 text-xs text-slate-500 hover:text-red-400"
                >
                  Xoá
                </button>
              </li>
            ))}
            {nodes.length === 0 && <li className="text-sm text-slate-500">Chưa có node nào.</li>}
          </ul>
        </div>

        {/* Edge list */}
        {edges.length > 0 && (
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <h2 className="mb-2 text-sm font-semibold">Liên kết ({edges.length})</h2>
            <ul className="flex flex-col gap-1">
              {edges.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-slate-300">
                    {labelOf(e.source_id)} → {labelOf(e.target_id)}
                  </span>
                  <button
                    onClick={() => {
                      const fd = new FormData();
                      fd.set("edgeId", e.id);
                      run(deleteEdge, fd);
                    }}
                    className="shrink-0 text-xs text-slate-500 hover:text-red-400"
                  >
                    Xoá
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Right: live preview */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <ProjectKnowledgeMap data={graph} notesById={notesById} />
      </div>
    </div>
  );
}
