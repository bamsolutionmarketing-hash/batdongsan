// "Hôm Nay" suggestion engine — rule-based, deterministic (no AI).
// 4 layers: time triggers → variety (avoid recently-used nodes) → weekly
// rhythm → pick nodes. Pure: all IO done by the caller (suggestToday).

export interface Trigger {
  triggerDate: string; // yyyy-mm-dd
  activeDaysBefore: number;
  suggestedAngle: string | null;
  nodeIds: string[];
  label: string;
}
export interface RecentPost {
  createdAt: string; // ISO
  nodeIds: string[];
}
export interface Candidate {
  id: string;
  label: string;
  category: string;
  projectId: string;
  projectSlug: string;
}
export interface DueNote {
  id: string;
  text: string;
}

export interface SuggestInput {
  today: Date;
  triggers: Trigger[];
  recent: RecentPost[];
  candidates: Candidate[];
  dueNotes: DueNote[];
  hadPostYesterday: boolean;
}

export interface SuggestedPost {
  title: string;
  reason: string;
  angle: string;
  projectId: string;
  projectSlug: string;
  nodeIds: string[];
  nodeLabels: string[];
}
export interface Task {
  id: string;
  label: string;
  kind: "note" | "share" | "story";
}
export interface Suggestion {
  post: SuggestedPost | null;
  tasks: Task[];
  streak: number;
}

// L3: weekly rhythm — Mon investment, Tue–Thu location/product, Fri–Sun community.
const WEEK_ANGLE: Record<number, string> = {
  0: "event", 1: "finance", 2: "location", 3: "project", 4: "masterplan", 5: "event", 6: "event",
};
const ANGLE_VI: Record<string, string> = {
  finance: "tài chính & thị trường", location: "vị trí", project: "sản phẩm dự án",
  masterplan: "khu đô thị", event: "cộng đồng & sự kiện", infra: "hạ tầng",
  developer: "chủ đầu tư", comparable: "so sánh", brand: "thương hiệu", group: "tập đoàn",
};
const angleVi = (a: string) => ANGLE_VI[a] ?? a;
const ymd = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

function triggerActive(today: Date, t: Trigger): boolean {
  const end = new Date(`${t.triggerDate}T00:00:00Z`);
  const start = addDays(end, -t.activeDaysBefore);
  const day = new Date(`${ymd(today)}T00:00:00Z`);
  return day >= start && day <= end;
}

// Consecutive days (ending today or yesterday) that have ≥1 post.
export function computeStreak(today: Date, recent: RecentPost[]): number {
  const days = new Set(recent.map((p) => p.createdAt.slice(0, 10)));
  let streak = 0;
  let cursor = days.has(ymd(today)) ? today : addDays(today, -1);
  if (!days.has(ymd(cursor))) return 0;
  while (days.has(ymd(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function chooseSuggestion(input: SuggestInput): Suggestion {
  const { today, triggers, recent, candidates, dueNotes, hadPostYesterday } = input;
  const streak = computeStreak(today, recent);

  const active = triggers.find((t) => triggerActive(today, t));
  const angle = active?.suggestedAngle ?? WEEK_ANGLE[today.getUTCDay()] ?? "project";

  // L4: pick nodes — trigger's nodes win; else nodes of the angle, preferring
  // those the agent hasn't used recently (variety), deterministic by id.
  const usedRecently = new Set(recent.flatMap((p) => p.nodeIds));
  let nodeIds: string[];
  let chosen: Candidate[];
  if (active && active.nodeIds.length) {
    chosen = candidates.filter((c) => active.nodeIds.includes(c.id));
    nodeIds = active.nodeIds.slice(0, 4);
  } else {
    const pool = candidates.filter((c) => c.category === angle);
    const ranked = (pool.length ? pool : candidates)
      .slice()
      .sort((a, b) => {
        const ua = usedRecently.has(a.id) ? 1 : 0;
        const ub = usedRecently.has(b.id) ? 1 : 0;
        return ua !== ub ? ua - ub : a.id.localeCompare(b.id);
      });
    chosen = ranked.slice(0, 3);
    nodeIds = chosen.map((c) => c.id);
  }

  const post: SuggestedPost | null = chosen.length
    ? {
        title: `Bài ${angleVi(angle)} hôm nay`,
        reason: active ? active.label : `Nhịp tuần: hôm nay nên đăng chủ đề ${angleVi(angle)}.`,
        angle,
        projectId: chosen[0].projectId,
        projectSlug: chosen[0].projectSlug,
        nodeIds,
        nodeLabels: chosen.map((c) => c.label),
      }
    : null;

  // Tasks ≤3: due notes first, then auto share / story.
  const tasks: Task[] = [];
  for (const n of dueNotes) tasks.push({ id: n.id, label: n.text, kind: "note" });
  if (hadPostYesterday) tasks.push({ id: "share", label: "Chia sẻ bài hôm qua vào group", kind: "share" });
  if (recent.length) tasks.push({ id: "story", label: "Đăng 1 story (ảnh 9:16)", kind: "story" });

  return { post, tasks: tasks.slice(0, 3), streak };
}
