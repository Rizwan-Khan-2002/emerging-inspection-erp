import { cookies } from "next/headers";
import type { Role, UserProfile } from "./types";
import { isSupabaseConfigured } from "./supabase/config";
import { createClient } from "./supabase/server";

export const SESSION_COOKIE = "ei_session_role";

/**
 * Demo users — one per role. Used for DEMO MODE login when Supabase is not
 * configured, and as profile fallbacks. In production, profiles come from the
 * `profiles` table keyed to Supabase Auth users.
 */
export const DEMO_USERS: Record<Role, UserProfile> = {
  super_admin: { id: "u-super", full_name: "Rizwan Khan", email: "admin@emerginginspection.com", role: "super_admin", phone: "+966500000001", active: true },
  owner: { id: "u-owner", full_name: "Abdullah Al-Saud", email: "owner@emerginginspection.com", role: "owner", phone: "+966500000002", active: true },
  admin: { id: "u-admin", full_name: "Faisal Admin", email: "office@emerginginspection.com", role: "admin", phone: "+966500000003", active: true },
  hr: { id: "u-hr", full_name: "Sara HR", email: "hr@emerginginspection.com", role: "hr", phone: "+966500000004", active: true },
  coordinator: { id: "u-coord", full_name: "Imran Coordinator", email: "ops@emerginginspection.com", role: "coordinator", phone: "+966500000005", active: true },
  inspector: { id: "u-insp", full_name: "Bilal Inspector", email: "field@emerginginspection.com", role: "inspector", phone: "+966500000006", active: true },
  client: { id: "u-client", full_name: "Khalid (SABIC)", email: "client@sabic-demo.com", role: "client", phone: "+966500000007", active: true },
};

/**
 * Resolve the current user.
 * - Demo mode: read role cookie → return matching demo user.
 * - Supabase mode: read auth user + profile row.
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profile) return profile as UserProfile;

      // Self-heal: auth user exists but has no profile row yet (e.g. account
      // created before the DB trigger, or trigger disabled). Create it now.
      // The designated owner email becomes super_admin; everyone else client.
      const ownerEmail = (process.env.OWNER_EMAIL ?? "").toLowerCase();
      const isOwner = !!user.email && user.email.toLowerCase() === ownerEmail;
      const fresh: UserProfile = {
        id: user.id,
        full_name:
          (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "User",
        email: user.email ?? "",
        role: isOwner ? "super_admin" : "client",
        active: true,
      };
      await supabase.from("profiles").upsert(fresh, { onConflict: "id" });
      return fresh;
    }
  }

  // Demo mode
  const store = await cookies();
  const role = store.get(SESSION_COOKIE)?.value as Role | undefined;
  if (role && DEMO_USERS[role]) return DEMO_USERS[role];
  return null;
}
