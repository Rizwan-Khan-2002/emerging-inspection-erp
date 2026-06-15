"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Role } from "@/lib/types";

/** Owner/admin creates a team member account directly with a role (no signup needed). */
export async function createTeamMember(data: {
  full_name: string; email: string; password: string; role: Role;
}): Promise<{ ok: boolean; error?: string }> {
  const me = await getCurrentUser();
  if (!me || !["super_admin", "owner", "admin"].includes(me.role)) {
    return { ok: false, error: "Not authorised." };
  }
  const admin = createAdminClient();
  if (!admin) {
    return { ok: false, error: "SERVICE_ROLE_KEY not configured. Add the Supabase service_role key to enable creating users." };
  }
  const { data: created, error } = await admin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: { full_name: data.full_name },
  });
  if (error) return { ok: false, error: error.message };
  if (created.user) {
    await admin.from("profiles").upsert({
      id: created.user.id, full_name: data.full_name, email: data.email, role: data.role, active: true,
    });
  }
  revalidatePath("/users");
  return { ok: true };
}

/** Wipe all sample/seed business data (super-admin only) for a clean client demo. */
export async function clearSampleData(): Promise<{ ok: boolean; error?: string; report?: string }> {
  if (!isSupabaseConfigured) return { ok: true };
  const me = await getCurrentUser();
  if (!me || me.role !== "super_admin") return { ok: false, error: "Super admin only — your DB role is not super_admin." };
  const sb = await createClient();
  if (!sb) return { ok: false, error: "No database connection." };

  // Order matters for FKs: children first.
  const tables = [
    "fuel_expenses", "overtime", "attendance", "payroll", "reports", "inspections",
    "lead_activities", "leads", "quotations", "invoices", "projects",
    "vehicle_service", "vehicles", "employees", "clients", "notifications", "expense_claims", "documents",
  ];
  const lines: string[] = [];
  for (const t of tables) {
    // .select() returns the deleted rows so we can count them and surface errors.
    const { data, error } = await sb.from(t).delete().not("id", "is", null).select("id");
    if (error) lines.push(`${t}: ERROR — ${error.message}`);
    else lines.push(`${t}: deleted ${data?.length ?? 0}`);
  }
  revalidatePath("/", "layout");
  return { ok: true, report: lines.join("\n") };
}

/** Super-admin / admin reassigns another user's role. */
export async function updateUserRole(userId: string, role: Role): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: true };
  const me = await getCurrentUser();
  if (!me || !["super_admin", "owner", "admin"].includes(me.role)) {
    return { ok: false, error: "Not authorised." };
  }
  const sb = await createClient();
  if (!sb) return { ok: false, error: "No database connection." };
  const { error } = await sb.from("profiles").update({ role }).eq("id", userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/users");
  return { ok: true };
}

/**
 * Bootstrap helper: promote the CURRENTLY logged-in user to super_admin.
 * Works via RLS "profiles self update" (a user may update their own row).
 * Intended for first-time setup — remove or gate behind a check before
 * going to production.
 */
export async function becomeSuperAdmin() {
  if (!isSupabaseConfigured) redirect("/dashboard");

  const user = await getCurrentUser();
  const sb = await createClient();
  if (user && sb) {
    await sb.from("profiles").update({ role: "super_admin" }).eq("id", user.id);
    revalidatePath("/", "layout");
  }
  redirect("/dashboard");
}
