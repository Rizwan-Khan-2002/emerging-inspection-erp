import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const SESSION_COOKIE = "ei_session_role";
const PUBLIC_PATHS = ["/login", "/auth"];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabaseConfigured = SUPABASE_URL.length > 0 && SUPABASE_KEY.length > 0;

/**
 * Auth gate.
 * - Only gates GET navigations; Server Action POSTs pass through.
 * - Supabase mode: validates/refreshes the session via getUser() (the
 *   canonical @supabase/ssr middleware pattern) so a stale or partial
 *   (e.g. PKCE code-verifier) cookie can never be mistaken for a session.
 * - Demo mode: presence of the role cookie counts as logged in.
 */
export async function proxy(req: NextRequest) {
  if (req.method !== "GET") return NextResponse.next();

  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  const res = NextResponse.next({ request: req });
  let authed = false;

  if (supabaseConfigured) {
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    });
    const { data } = await supabase.auth.getUser();
    authed = !!data.user;
  } else {
    authed = req.cookies.has(SESSION_COOKIE);
  }

  // Authenticated user on a public auth page → dashboard.
  if (isPublic && authed && pathname !== "/auth/callback") {
    return copyCookies(NextResponse.redirect(new URL("/dashboard", req.url)), res);
  }
  // Unauthenticated user on a protected page → login.
  if (!isPublic && !authed) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return copyCookies(NextResponse.redirect(url), res);
  }

  return res;
}

/** Carry any refreshed Supabase cookies onto a redirect response. */
function copyCookies(target: NextResponse, from: NextResponse) {
  from.cookies.getAll().forEach((c) => target.cookies.set(c));
  return target;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png).*)"],
};
