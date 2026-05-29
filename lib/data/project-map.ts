import { createClient } from "@/lib/supabase/server";
import { buildProjectGraph, type MapNodeRow, type MapEdgeRow } from "@/lib/map/project-graph";
import type { GraphData } from "./types";

export {
  NODE_KIND_COLORS,
  NODE_KIND_LABEL,
  EDGE_KIND_COLORS,
  buildProjectGraph,
} from "@/lib/map/project-graph";
export type { MapNodeRow, MapEdgeRow } from "@/lib/map/project-graph";

export interface ProjectMap {
  graph: GraphData;
  notesById: Record<string, { label: string; kind: string; note: string | null }>;
  nodes: MapNodeRow[];
  edges: MapEdgeRow[];
}

// Load a project's knowledge graph (RLS scopes to org + public projects).
export async function getProjectMap(projectId: string): Promise<ProjectMap> {
  const supabase = createClient();
  const [{ data: nodes }, { data: edges }] = await Promise.all([
    supabase.from("map_nodes").select("id, label, kind, note").eq("project_id", projectId),
    supabase.from("map_edges").select("id, source_id, target_id, kind").eq("project_id", projectId),
  ]);
  const nodeRows = (nodes as MapNodeRow[]) ?? [];
  const edgeRows = (edges as MapEdgeRow[]) ?? [];
  const notesById: ProjectMap["notesById"] = {};
  for (const n of nodeRows) notesById[n.id] = { label: n.label, kind: n.kind, note: n.note };
  return { graph: buildProjectGraph(nodeRows, edgeRows), notesById, nodes: nodeRows, edges: edgeRows };
}
