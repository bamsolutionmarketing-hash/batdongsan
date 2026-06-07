// Góc nhìn (angle) presets + category clusters for script coherence.
// Deterministic, no LLM. Used to (a) score/flag whether the agent's chosen
// knowledge nodes hang together, and (b) inject a single through-line + arc
// into the copy-paste AI prompt so an external LLM keeps one coherent story.

export type AngleId = "dau_tu" | "vi_tri" | "tien_ich" | "phap_ly" | "tien_do";

export interface AngleDef {
  id: AngleId;
  label: string; // full label (UI + prompt)
  short: string; // chip label
  categories: string[]; // knowledge-node categories that cohere under this angle
  guide: string; // one-line framing for the prompt
  arc: string; // default narrative arc (flexible by pillar)
}

export const ANGLES: AngleDef[] = [
  {
    id: "dau_tu",
    label: "Đầu tư – tài chính",
    short: "Đầu tư",
    categories: ["finance", "comparable", "policy"],
    guide: "Vì sao đáng tiền & an toàn dòng vốn (giá, mốc so sánh, chính sách) — KHÔNG hứa lợi nhuận.",
    arc: "Hook chạm băn khoăn về giá/đầu tư → bối cảnh thị trường → 2–3 dẫn chứng tài chính (giá, mốc so sánh, chính sách) → chốt 'đáng cân nhắc' → CTA tư vấn.",
  },
  {
    id: "vi_tri",
    label: "Vị trí – kết nối",
    short: "Vị trí",
    categories: ["location", "metro", "road", "infra", "zone"],
    guide: "Lợi thế vị trí & khả năng kết nối (trục đường, metro, hạ tầng, khu vực).",
    arc: "Hook về vị trí/kết nối → bối cảnh khu vực → 2–3 điểm kết nối (đường, metro, hạ tầng) → chốt 'tâm điểm kết nối' → CTA.",
  },
  {
    id: "tien_ich",
    label: "Tiện ích – sống",
    short: "Tiện ích",
    categories: ["amenity", "masterplan", "cluster", "concept"],
    guide: "Trải nghiệm sống & tiện ích (quy hoạch, phân khu, tiện ích nội khu, concept).",
    arc: "Hook về chất sống → bối cảnh nhu cầu ở → 2–3 tiện ích/quy hoạch nổi bật → chốt 'sống tiện nghi' → CTA.",
  },
  {
    id: "phap_ly",
    label: "Pháp lý – an toàn",
    short: "Pháp lý",
    categories: ["legal", "cert", "developer", "brand", "partner", "group"],
    guide: "Yên tâm pháp lý & uy tín (giấy tờ, chứng nhận, chủ đầu tư, đối tác).",
    arc: "Hook chạm nỗi lo pháp lý → bối cảnh rủi ro thị trường → 2–3 bằng chứng (pháp lý, CĐT, đối tác) → chốt 'an tâm xuống tiền' → CTA.",
  },
  {
    id: "tien_do",
    label: "Tiến độ – sản phẩm",
    short: "Tiến độ",
    categories: ["event", "selling_point", "project", "phase"],
    guide: "Sản phẩm & tiến độ/sự kiện (điểm nổi bật, giai đoạn, sự kiện mở bán).",
    arc: "Hook về cơ hội/sự kiện → bối cảnh giỏ hàng → 2–3 điểm sản phẩm/tiến độ → chốt 'thời điểm phù hợp' → CTA.",
  },
];

export const getAngle = (id?: string | null): AngleDef | undefined => ANGLES.find((a) => a.id === id);

// Which angle cluster a category belongs to (first match), if any.
export function clusterOf(category?: string | null): AngleId | undefined {
  if (!category) return undefined;
  return ANGLES.find((a) => a.categories.includes(category))?.id;
}

export interface CohesionNode {
  label: string;
  category?: string | null;
}
export interface CohesionResult {
  score: number; // 0–100 — how well the node set serves the chosen angle
  offTopic: string[]; // node labels outside the chosen angle's cluster
  suggestedAngleId?: AngleId; // angle covering the most selected nodes
}

// Coherence of a node set against a chosen angle. Rewards nodes inside the
// angle's cluster, penalises spread across other clusters (the "nhảy chủ đề"
// problem). No angle / no nodes → neutral score.
export function cohesion(angleId: string | null | undefined, nodes: CohesionNode[]): CohesionResult {
  // Suggested angle = the cluster covering the most selected categories.
  const tally = new Map<AngleId, number>();
  for (const n of nodes) {
    const cl = clusterOf(n.category);
    if (cl) tally.set(cl, (tally.get(cl) ?? 0) + 1);
  }
  let suggestedAngleId: AngleId | undefined;
  let best = 0;
  for (const [id, count] of tally) if (count > best) { best = count; suggestedAngleId = id; }

  const angle = getAngle(angleId);
  if (nodes.length === 0) return { score: 100, offTopic: [], suggestedAngleId };
  if (!angle) return { score: 60, offTopic: [], suggestedAngleId };

  const inCluster = nodes.filter((n) => n.category && angle.categories.includes(n.category));
  const offTopic = nodes.filter((n) => !(n.category && angle.categories.includes(n.category))).map((n) => n.label);
  const offClusters = new Set<AngleId>();
  for (const n of nodes) {
    if (!(n.category && angle.categories.includes(n.category))) {
      const cl = clusterOf(n.category);
      if (cl) offClusters.add(cl);
    }
  }
  let score = Math.round((inCluster.length / nodes.length) * 100);
  score -= offClusters.size * 8; // spread penalty per distinct off-topic cluster
  score = Math.max(0, Math.min(100, score));
  return { score, offTopic, suggestedAngleId };
}
