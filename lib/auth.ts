import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import type { UserRole } from "@/types/domain";

export interface Profile {
  id: string;
  role: UserRole;
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
// React.cache: layout + page + nested components all call this during one
// request — without dedupe that's 2 network round trips (auth + profile) EACH,
// which made every tab switch noticeably slower.
export const getSession = cache(async (): Promise<SessionContext | null> => {
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

  const row = profile as { id: string; role: UserRole; full_name: string | null } | null;
  return {
    userId: user.id,
    email: user.email ?? null,
    profile: row ? { id: row.id, role: row.role, fullName: row.full_name } : null,
  };
});

export async function requireSession(): Promise<SessionContext> {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  return session;
}

// Staff = admin OR super_admin (both reach the /admin panel).
export function isAdmin(session: SessionContext | null): boolean {
  return session?.profile?.role === "admin" || session?.profile?.role === "super_admin";
}

// Super admin = full app control (projects/content + manage admins).
export function isSuperAdmin(session: SessionContext | null): boolean {
  return session?.profile?.role === "super_admin";
}

// Guard for super-admin-only pages (content management). Redirects to /admin.
export async function requireSuper(): Promise<SessionContext> {
  const session = await getSession();
  if (!isSuperAdmin(session)) redirect("/admin");
  return session!;
}
