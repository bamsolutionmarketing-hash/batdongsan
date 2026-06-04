import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/types/domain";

export interface Developer {
  id: string;
  name: string;
  slug: string;
}

// Developer name by id (for project headers). Returns null when unknown.
export async function getDeveloper(id: string | null): Promise<Result<Developer | null>> {
  if (!id || !isSupabaseConfigured()) return ok(null);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("developers")
    .select("id, name, slug")
    .eq("id", id)
    .maybeSingle();
  if (error) return err("INTERNAL", error.message);
  return ok((data as Developer) ?? null);
}
