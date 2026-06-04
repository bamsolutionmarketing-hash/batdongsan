import { createClient } from "@/lib/supabase/server";

export interface Profile {
  id: string;
  role: "agent" | "admin";
  fullName: string | null;
}

export interface SessionContext {
  userId: string;
  email: string | null;
  profile: Profile | null;
}

// Current authenticated user + their profile (role), or null if signed out.
// Returns null (rather than throwing) when Supabase is unconfigured/unreachable,
// so public pages still render instead of a server-side exception.
export async function getSession(): Promise<SessionContext | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  const supabase = createClient();
  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    return null;
  }
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const row = profile as { id: string; role: "agent" | "admin"; full_name: string | null } | null;
  return {
    userId: user.id,
    email: user.email ?? null,
    profile: row ? { id: row.id, role: row.role, fullName: row.full_name } : null,
  };
}

export async function requireSession(): Promise<SessionContext> {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  return session;
}

export function isAdmin(session: SessionContext | null): boolean {
  return session?.profile?.role === "admin";
}
