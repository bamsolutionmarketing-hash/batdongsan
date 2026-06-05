import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/types/domain";

export interface QuickNote {
  id: string; text: string; remindAt: string | null; doneAt: string | null;
}
interface Row { id: string; text: string; remind_at: string | null; done_at: string | null }
const toNote = (r: Row): QuickNote => ({ id: r.id, text: r.text, remindAt: r.remind_at, doneAt: r.done_at });

export async function listNotes(userId: string): Promise<Result<QuickNote[]>> {
  if (!isSupabaseConfigured()) return ok([]);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quick_notes")
    .select("id, text, remind_at, done_at")
    .eq("user_id", userId)
    .order("done_at", { ascending: true, nullsFirst: true })
    .order("remind_at", { ascending: true, nullsFirst: false })
    .limit(200);
  if (error) return err("INTERNAL", error.message);
  return ok((data as Row[]).map(toNote));
}

// Notes due today (remind_at <= today) and not done.
export async function listDueNotes(userId: string, today: string): Promise<Result<QuickNote[]>> {
  if (!isSupabaseConfigured()) return ok([]);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quick_notes")
    .select("id, text, remind_at, done_at")
    .eq("user_id", userId)
    .is("done_at", null)
    .lte("remind_at", today)
    .limit(50);
  if (error) return err("INTERNAL", error.message);
  return ok((data as Row[]).map(toNote));
}
