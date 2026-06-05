"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";

export async function createNote(fd: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const text = String(fd.get("text") ?? "").trim();
  const remind = String(fd.get("remind_at") ?? "").trim() || null;
  if (!text) redirect("/notes?error=" + encodeURIComponent("Nội dung trống"));
  const supabase = createClient();
  const { error } = await supabase.from("quick_notes").insert({ user_id: session.userId, text, remind_at: remind });
  if (error) redirect("/notes?error=" + encodeURIComponent(error.message));
  revalidatePath("/notes");
  redirect("/notes?ok=1");
}

export async function toggleNote(fd: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const id = String(fd.get("id") ?? "");
  const done = String(fd.get("done") ?? "") === "1";
  const supabase = createClient();
  await supabase.from("quick_notes").update({ done_at: done ? new Date().toISOString() : null }).eq("id", id);
  revalidatePath("/notes");
  revalidatePath("/dashboard");
  redirect("/notes");
}
