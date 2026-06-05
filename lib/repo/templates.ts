import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, err, type Result } from "@/types/domain";
import type { AssemblyTemplate } from "@/lib/engine/templates";

// assembly_templates is RLS server-only → service-role read.
interface TemplateRow {
  id: string;
  angle_match: string[];
  structure: string[];
  weight: number;
}

export async function listTemplates(): Promise<Result<AssemblyTemplate[]>> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch (e) {
    return err("INTERNAL", (e as Error).message);
  }
  const { data, error } = await supabase
    .from("assembly_templates")
    .select("id, angle_match, structure, weight")
    .eq("is_enabled", true);
  if (error) return err("INTERNAL", error.message);
  return ok(
    (data as TemplateRow[]).map((r) => ({
      id: r.id,
      angleMatch: r.angle_match ?? [],
      structure: r.structure ?? [],
      weight: r.weight ?? 1,
    })),
  );
}
