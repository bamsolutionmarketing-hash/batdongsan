"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface ContactState {
  ok?: boolean;
  error?: string;
}

// Capture a sales lead from the public "contact to buy" form. Uses the
// service-role client because anon users are blocked from `leads` by RLS.
export async function submitLead(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const contact = String(formData.get("contact") ?? "").trim();
  const orgName = String(formData.get("orgName") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const seatsRaw = String(formData.get("seats") ?? "").trim();

  if (!contact) return { error: "Vui lòng để lại email hoặc số điện thoại." };
  const seats = seatsRaw ? Number(seatsRaw) : null;
  if (seats !== null && (Number.isNaN(seats) || seats < 0)) {
    return { error: "Số lượng tài khoản phải là số." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("leads").insert({
    contact,
    org_name: orgName || null,
    message: message || null,
    seats,
  });
  if (error) return { error: error.message };

  return { ok: true };
}
