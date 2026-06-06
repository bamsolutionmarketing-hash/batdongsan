"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Add a personal calendar event on a given day (optionally tied to a project).
export async function addEvent(fd: FormData) {
  const session = await requireSession();
  const date = str(fd, "event_date");
  const title = str(fd, "title");
  const note = str(fd, "note");
  const projectId = str(fd, "project_id");
  const y = str(fd, "y");
  const m = str(fd, "m");
  const back = `/calendar?y=${y}&m=${m}&d=${date}`;
  if (!DATE_RE.test(date) || !title) redirect(`${back}&error=${encodeURIComponent("Thiếu ngày hoặc tiêu đề")}`);

  const { error } = await createClient().from("calendar_events").insert({
    user_id: session.userId,
    event_date: date,
    title,
    note: note || null,
    project_id: projectId || null,
  });
  if (error) redirect(`${back}&error=${encodeURIComponent(error.message)}`);
  revalidatePath("/calendar");
  redirect(back);
}

export async function deleteEvent(fd: FormData) {
  const session = await requireSession();
  const id = str(fd, "id");
  const back = `/calendar?y=${str(fd, "y")}&m=${str(fd, "m")}&d=${str(fd, "event_date")}`;
  const { error } = await createClient()
    .from("calendar_events")
    .delete()
    .eq("id", id)
    .eq("user_id", session.userId);
  if (error) redirect(`${back}&error=${encodeURIComponent(error.message)}`);
  revalidatePath("/calendar");
  redirect(back);
}
