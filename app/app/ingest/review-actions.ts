"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";

export interface ReviewState {
  error?: string;
  ok?: boolean;
}

// Map an extraction field onto the projects column it updates.
const FIELD_TO_COLUMN: Record<string, string> = {
  price_per_sqm: "price_per_sqm_m",
  district: "district",
  developer: "developer",
  segment: "segment",
};

// Confirm a (possibly edited) extraction and apply it to its project.
export async function confirmExtraction(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const session = await requireSession();
  const orgId = session.profile?.org_id;
  if (session.profile?.role !== "admin" || !orgId) {
    return { error: "Chỉ quản trị viên." };
  }

  const id = String(formData.get("extractionId") ?? "");
  const value = String(formData.get("value") ?? "").trim();
  if (!id) return { error: "Thiếu extraction id." };

  const supabase = createClient();

  // Load the extraction (RLS keeps it within the org).
  const { data: ex, error: exErr } = await supabase
    .from("extractions")
    .select("id, project_id, field")
    .eq("id", id)
    .single();
  if (exErr) return { error: exErr.message };

  // Mark confirmed (store the edited value).
  const { error: updErr } = await supabase
    .from("extractions")
    .update({ value, status: "confirmed" })
    .eq("id", id);
  if (updErr) return { error: updErr.message };

  // Apply to the linked project.
  if (ex.project_id) {
    if (ex.field === "amenities") {
      const { data: proj } = await supabase
        .from("projects")
        .select("attributes")
        .eq("id", ex.project_id)
        .single();
      const attrs = (proj?.attributes as { amenities?: string[] }) ?? {};
      const amenities = Array.from(new Set([...(attrs.amenities ?? []), value]));
      await supabase
        .from("projects")
        .update({ attributes: { ...attrs, amenities } })
        .eq("id", ex.project_id);
    } else {
      const column = FIELD_TO_COLUMN[ex.field];
      if (column) {
        const payload =
          column === "price_per_sqm_m" ? { [column]: Number(value) } : { [column]: value };
        await supabase.from("projects").update(payload).eq("id", ex.project_id);
      }
    }
  }

  revalidatePath(`/app/ingest/${formData.get("documentId")}`);
  return { ok: true };
}

export async function rejectExtraction(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const session = await requireSession();
  if (session.profile?.role !== "admin") return { error: "Chỉ quản trị viên." };

  const id = String(formData.get("extractionId") ?? "");
  if (!id) return { error: "Thiếu extraction id." };

  const supabase = createClient();
  const { error } = await supabase
    .from("extractions")
    .update({ status: "rejected" })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/app/ingest/${formData.get("documentId")}`);
  return { ok: true };
}
