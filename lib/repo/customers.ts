import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/types/domain";
import type { Tier } from "@/lib/finance/lead";
import type { Customer, CustomerStatus } from "./customer-types";

export { STATUS_LABEL } from "./customer-types";
export type { Customer, CustomerStatus } from "./customer-types";

interface Row {
  id: string; name: string; phone: string | null; source: string | null; status: CustomerStatus;
  lead_score: number | null; lead_tier: Tier | null; income_low: number | null; income_high: number | null;
  discovery: Record<string, unknown> | null; assessment: Record<string, unknown> | null;
  note: string | null; next_followup_at: string | null; updated_at: string;
}

const COLS = "id, name, phone, source, status, lead_score, lead_tier, income_low, income_high, discovery, assessment, note, next_followup_at, updated_at";

const toCustomer = (r: Row): Customer => ({
  id: r.id, name: r.name, phone: r.phone, source: r.source, status: r.status,
  leadScore: r.lead_score, leadTier: r.lead_tier, incomeLow: r.income_low, incomeHigh: r.income_high,
  discovery: r.discovery, assessment: r.assessment, note: r.note,
  nextFollowupAt: r.next_followup_at, updatedAt: r.updated_at,
});

export async function listCustomers(userId: string): Promise<Result<Customer[]>> {
  if (!isSupabaseConfigured()) return ok([]);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("customers")
    .select(COLS)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(500);
  if (error) return err("INTERNAL", error.message);
  return ok((data as Row[]).map(toCustomer));
}

// Follow-ups due (next_followup_at <= today) on customers still in play —
// surfaced on the dashboard so hot leads don't silently go cold.
export async function listDueFollowups(userId: string, today: string): Promise<Result<Customer[]>> {
  if (!isSupabaseConfigured()) return ok([]);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("customers")
    .select(COLS)
    .eq("user_id", userId)
    .lte("next_followup_at", today)
    .not("status", "in", "(da_chot,ngung)")
    .order("next_followup_at", { ascending: true })
    .limit(50);
  if (error) return err("INTERNAL", error.message);
  return ok((data as Row[]).map(toCustomer));
}
