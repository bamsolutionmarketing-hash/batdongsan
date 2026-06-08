import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const DEVICE_COOKIE = "bds_device";
const DEVICE_MAXAGE = 60 * 60 * 24 * 400; // ~400 days

function setDeviceCookie(res: NextResponse, deviceId: string) {
  res.cookies.set(DEVICE_COOKIE, deviceId, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: DEVICE_MAXAGE,
  });
}

// Build a redirect that preserves any auth cookies written on `res`
// (session refresh / sign-out) plus the device cookie.
function redirectPreserving(res: NextResponse, url: URL, deviceId: string): NextResponse {
  const r = NextResponse.redirect(url);
  res.cookies.getAll().forEach((c) => r.cookies.set(c));
  setDeviceCookie(r, deviceId);
  return r;
}

// Refreshes the Supabase auth session on every request, gates private routes,
// and enforces the per-account device limit (max 2 for agent/admin).
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return response;
  }

  let res = response;
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        res = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          res.cookies.set(name, value, options),
        );
      },
    },
  });

  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    return res;
  }

  const path = request.nextUrl.pathname;
  const isPublic =
    path === "/" ||
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/auth") ||
    path.startsWith("/contact") ||
    path.startsWith("/pricing") ||
    path.startsWith("/p/") ||
    path === "/kmap" ||
    path.startsWith("/kmap/");

  if (!user && !isPublic) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(redirectUrl);
  }

  // ── device limit enforcement (agent + admin; super exempt server-side) ────
  let deviceId = request.cookies.get(DEVICE_COOKIE)?.value;
  const newDevice = !deviceId;
  if (!deviceId) deviceId = crypto.randomUUID();

  // Skip the chooser page itself to avoid redirect loops.
  const enforce = !!user && !isPublic && !path.startsWith("/devices");
  if (enforce) {
    const ua = request.headers.get("user-agent") ?? "";
    const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
    try {
      const { data: status } = await supabase.rpc("device_check", {
        p_device_id: deviceId, p_user_agent: ua, p_ip: ip,
      });
      if (status === "revoked") {
        await supabase.auth.signOut();
        const u = request.nextUrl.clone();
        u.pathname = "/login";
        u.search = "";
        u.searchParams.set("reason", "device");
        return redirectPreserving(res, u, deviceId);
      }
      if (status === "choose") {
        const u = request.nextUrl.clone();
        u.pathname = "/devices";
        u.search = "";
        return redirectPreserving(res, u, deviceId);
      }
    } catch {
      // Never lock the whole app out on a transient error.
    }
  }

  if (newDevice) setDeviceCookie(res, deviceId);
  return res;
}
