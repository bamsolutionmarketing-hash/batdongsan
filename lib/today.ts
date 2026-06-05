import "server-only";
import { listTriggers } from "@/lib/repo/triggers";
import { listDueNotes } from "@/lib/repo/notes";
import { listRecentPosts } from "@/lib/repo/posts";
import { candidateNodes } from "@/lib/repo/nodes";
import { chooseSuggestion, type Suggestion } from "@/lib/engine/suggestion";

const ymd = (d: Date) => d.toISOString().slice(0, 10);

// Assemble the "Hôm Nay" suggestion for a user (IO + pure engine).
export async function getToday(userId: string): Promise<Suggestion> {
  const today = new Date();
  const [trig, recentRes, cands, due] = await Promise.all([
    listTriggers(),
    listRecentPosts(userId),
    candidateNodes(),
    listDueNotes(userId, ymd(today)),
  ]);
  const recent = recentRes.ok ? recentRes.data : [];
  const yesterday = ymd(new Date(today.getTime() - 86400000));
  const hadPostYesterday = recent.some((p) => p.createdAt.slice(0, 10) === yesterday);

  return chooseSuggestion({
    today,
    triggers: trig.ok ? trig.data : [],
    recent,
    candidates: cands.ok ? cands.data : [],
    dueNotes: due.ok ? due.data.map((n) => ({ id: n.id, text: n.text })) : [],
    hadPostYesterday,
  });
}
