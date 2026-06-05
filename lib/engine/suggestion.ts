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
  /** Days (yyyy-mm-dd) a post was marked posted — drives the streak when given. */
  streakDays?: string[];
}

export interface SuggestedPost {
  title: string;
  reason: string;
  angle: string;
  projectId: string;
  projectSlug: string;
  nodeIds: string[];
  nodeLabels: string[];
  daysLeft?: number | null; // days until a trigger deadline (countdown), if any
}
export interface Task {
  id: string;
  label: string;
  kind: "note" | "share" | "story";
}
export interface Suggestion {
  post: SuggestedPost | null; // primary
  alternates: SuggestedPost[]; // up to 2 more, different angles
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

// Pick up to 3 candidate nodes of an angle, preferring unused ones (variety),
// excluding ids already taken by another suggestion. Deterministic by id.
function pickForAngle(
  angle: string, candidates: Candidate[], usedRecently: Set<string>, exclude: Set<string>,
): Candidate[] {
  const avail = candidates.filter((c) => !exclude.has(c.id));
  const pool = avail.filter((c) => c.category === angle);
  return (pool.length ? pool : avail)
    .slice()
    .sort((a, b) => {
      const ua = usedRecently.has(a.id) ? 1 : 0;
      const ub = usedRecently.has(b.id) ? 1 : 0;
      return ua !== ub ? ua - ub : a.id.localeCompare(b.id);
    })
    .slice(0, 3);
}

const daysBetween = (today: Date, dateStr: string) =>
  Math.round((new Date(`${dateStr}T00:00:00Z`).getTime() - new Date(`${ymd(today)}T00:00:00Z`).getTime()) / 86400000);

export function chooseSuggestion(input: SuggestInput): Suggestion {
  const { today, triggers, recent, candidates, dueNotes, hadPostYesterday } = input;
  // Streak from posted days when provided, else from recent (created) posts.
  const streakSource = input.streakDays
    ? input.streakDays.map((d) => ({ createdAt: d, nodeIds: [] as string[] }))
    : recent;
  const streak = computeStreak(today, streakSource);
  const usedRecently = new Set(recent.flatMap((p) => p.nodeIds));

  const active = triggers.find((t) => triggerActive(today, t));
  const angle = active?.suggestedAngle ?? WEEK_ANGLE[today.getUTCDay()] ?? "project";

  // ── Primary suggestion (trigger nodes win; else the day's angle) ──────────
  let chosen: Candidate[];
  let nodeIds: string[];
  if (active && active.nodeIds.length) {
    chosen = candidates.filter((c) => active.nodeIds.includes(c.id));
    nodeIds = active.nodeIds.slice(0, 4);
  } else {
    chosen = pickForAngle(angle, candidates, usedRecently, new Set());
    nodeIds = chosen.map((c) => c.id);
  }

  const daysLeft = active ? daysBetween(today, active.triggerDate) : null;
  const post: SuggestedPost | null = chosen.length
    ? {
        title: `Bài ${angleVi(angle)} hôm nay`,
        reason: active
          ? `${active.label}${daysLeft != null && daysLeft >= 0 ? ` · còn ${daysLeft} ngày` : ""}`
          : `Nhịp tuần: hôm nay nên đăng chủ đề ${angleVi(angle)}.`,
        angle,
        projectId: chosen[0].projectId,
        projectSlug: chosen[0].projectSlug,
        nodeIds,
        nodeLabels: chosen.map((c) => c.label),
        daysLeft,
      }
    : null;

  // ── Alternates: up to 2 more from OTHER angles, distinct nodes ─────────────
  const taken = new Set(nodeIds);
  const day = today.getUTCDay();
  const otherAngles = [
    WEEK_ANGLE[(day + 1) % 7], WEEK_ANGLE[(day + 2) % 7],
    ...[...new Set(candidates.map((c) => c.category))],
  ].filter((a) => a && a !== angle);
  const alternates: SuggestedPost[] = [];
  for (const a of otherAngles) {
    if (alternates.length >= 2) break;
    if (alternates.some((x) => x.angle === a)) continue;
    const pick = pickForAngle(a, candidates, usedRecently, taken);
    if (!pick.length) continue;
    pick.forEach((c) => taken.add(c.id));
    alternates.push({
      title: `Góc ${angleVi(a)}`,
      reason: `Đổi không khí: thử chủ đề ${angleVi(a)}.`,
      angle: a,
      projectId: pick[0].projectId,
      projectSlug: pick[0].projectSlug,
      nodeIds: pick.map((c) => c.id),
      nodeLabels: pick.map((c) => c.label),
      daysLeft: null,
    });
  }

  // Tasks ≤3: due notes first, then auto share / story.
  const tasks: Task[] = [];
  for (const n of dueNotes) tasks.push({ id: n.id, label: n.text, kind: "note" });
  if (hadPostYesterday) tasks.push({ id: "share", label: "Chia sẻ bài hôm qua vào group", kind: "share" });
  if (recent.length) tasks.push({ id: "story", label: "Đăng 1 story (ảnh 9:16)", kind: "story" });

  return { post, alternates, tasks: tasks.slice(0, 3), streak };
}
