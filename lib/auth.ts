import { createClient } from "@/lib/supabase/server";

export interface Profile {
  user_id: string;
  org_id: string | null;
  role: "admin" | "member";
}

export interface SessionContext {
  userId: string;
  email: string | null;
  profile: Profile | null;
}

// Current authenticated user + their profile (org/role), or null if signed out.
// Returns null (rather than throwing) when Supabase is unconfigured/unreachable,
// so public pages still render instead of showing a server-side exception.
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
    .select("user_id, org_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? null,
    profile: (profile as Profile) ?? null,
  };
}

export async function requireSession(): Promise<SessionContext> {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  return session;
}
