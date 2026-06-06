import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/types/domain";

export interface CalendarEvent {
  id: string;
  eventDate: string; // YYYY-MM-DD
  title: string;
  note: string | null;
  projectId: string | null;
  projectName: string | null;
}

interface Row {
  id: string;
  event_date: string;
  title: string;
  note: string | null;
  project_id: string | null;
  projects: { name: string } | { name: string }[] | null;
}

const toEvent = (r: Row): CalendarEvent => {
  const proj = Array.isArray(r.projects) ? r.projects[0] : r.projects;
  return {
    id: r.id,
    eventDate: r.event_date,
    title: r.title,
    note: r.note,
    projectId: r.project_id,
    projectName: proj?.name ?? null,
  };
};

// Events for a user within [from, to] (inclusive), ascending.
export async function listEventsInRange(
  userId: string, from: string, to: string,
): Promise<Result<CalendarEvent[]>> {
  if (!isSupabaseConfigured()) return ok([]);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("calendar_events")
    .select("id, event_date, title, note, project_id, projects(name)")
    .eq("user_id", userId)
    .gte("event_date", from)
    .lte("event_date", to)
    .order("event_date", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) return err("INTERNAL", error.message);
  return ok((data as Row[]).map(toEvent));
}
