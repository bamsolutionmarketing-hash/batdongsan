import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/types/domain";
import type { Trigger } from "@/lib/engine/suggestion";

interface Row {
  trigger_date: string; active_days_before: number; suggested_angle: string | null;
  node_ids: string[] | null; label: string;
}

// Enabled time triggers (RLS scopes to demo/published projects).
export async function listTriggers(): Promise<Result<Trigger[]>> {
  if (!isSupabaseConfigured()) return ok([]);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("time_triggers")
    .select("trigger_date, active_days_before, suggested_angle, node_ids, label")
    .eq("is_enabled", true)
    .limit(200);
  if (error) return err("INTERNAL", error.message);
  return ok((data as Row[]).map((r) => ({
    triggerDate: r.trigger_date,
    activeDaysBefore: r.active_days_before,
    suggestedAngle: r.suggested_angle,
    nodeIds: r.node_ids ?? [],
    label: r.label,
  })));
}
