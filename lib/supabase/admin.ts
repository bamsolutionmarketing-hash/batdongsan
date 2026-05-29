import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client (bypasses RLS). SERVER-ONLY — never import in client code.
// Use for privileged ops: lead inserts, ingestion writes, signed URLs.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
