"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@/lib/types";
import { SESSION_COOKIE } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 1 week
};

/** DEMO MODE — sign in by picking a role. */
export async function signInDemo(role: Role) {
  const store = await cookies();
  store.set(SESSION_COOKIE, role, COOKIE_OPTS);
  redirect("/dashboard");
}

/** Supabase email/password sign-in (used when configured). */
export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!isSupabaseConfigured) {
    return { error: "Supabase is not configured. Use a demo role to sign in." };
  }
  const supabase = await createClient();
  if (!supabase) return { error: "Auth unavailable." };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  redirect("/dashboard");
}

/** Supabase email/password sign-up. First user becomes super_admin (DB trigger). */
export async function signUpWithPassword(formData: FormData) {
  const full_name = String(formData.get("full_name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!isSupabaseConfigured) {
    return { error: "Supabase is not configured." };
  }
  const supabase = await createClient();
  if (!supabase) return { error: "Auth unavailable." };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name } },
  });
  if (error) return { error: error.message };

  // If email confirmation is OFF, a session is returned → straight in.
  if (data.session) redirect("/dashboard");

  return { info: "Account created. If email confirmation is enabled, confirm via the email, then sign in." };
}

export async function signOut() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase?.auth.signOut();
  }
  redirect("/login");
}
