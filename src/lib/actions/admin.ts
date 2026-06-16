"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ROLE_LABELS } from "@/lib/constants";
import { sendEmail, emailLayout, button } from "@/lib/email";
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
    // Staff roles also become an Employee record (so they appear under Employees).
    if (["admin", "hr", "coordinator", "inspector"].includes(data.role)) {
      const code = `EMP-${created.user.id.slice(0, 6).toUpperCase()}`;
      await admin.from("employees").insert({
        profile_id: created.user.id,
        employee_code: code,
        full_name: data.full_name,
        email: data.email,
        position: ROLE_LABELS[data.role],
        department: "Operations",
        status: "active",
      });
    }
  }

  // Send a branded invite email with login details (best-effort — never blocks creation).
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://emerging-erp.vercel.app";
  await sendEmail({
    to: data.email,
    subject: "You've been added to Emerging Inspection ERP",
    html: emailLayout("Welcome to the team 👋", `
      <p>Hi ${data.full_name},</p>
      <p>An account has been created for you on <strong>Emerging Inspection ERP</strong> as <strong>${ROLE_LABELS[data.role]}</strong>.</p>
      <p style="background:#071827;border:1px solid #1c3650;border-radius:8px;padding:12px 16px">
        <strong style="color:#fff">Login email:</strong> ${data.email}<br/>
        <strong style="color:#fff">Temporary password:</strong> ${data.password}
      </p>
      <p>Please sign in and change your password from your profile.</p>
      <p style="margin:20px 0">${button(`${appUrl}/login`, "Sign in to ERP")}</p>
      <p style="color:#6b7c8d;font-size:12px">If you didn't expect this, you can ignore this email.</p>
    `),
  });

  revalidatePath("/users");
  revalidatePath("/employees");
  return { ok: true };
}

/** Set a new password for a user (admin). */
export async function resetUserPassword(userId: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const me = await getCurrentUser();
  if (!me || !["super_admin", "owner", "admin"].includes(me.role)) return { ok: false, error: "Not authorised." };
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Admin not configured." };
  const { error } = await admin.auth.admin.updateUserById(userId, { password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Activate / deactivate a user (deactivated users are blocked at login). */
export async function setUserActive(userId: string, active: boolean): Promise<{ ok: boolean; error?: string }> {
  const me = await getCurrentUser();
  if (!me || !["super_admin", "owner", "admin"].includes(me.role)) return { ok: false, error: "Not authorised." };
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Admin not configured." };
  await admin.from("profiles").update({ active }).eq("id", userId);
  await admin.auth.admin.updateUserById(userId, active ? { ban_duration: "none" } : { ban_duration: "876000h" });
  revalidatePath("/users");
  return { ok: true };
}

/** Permanently remove a user account (and their profile/employee via cascade). */
export async function removeUser(userId: string): Promise<{ ok: boolean; error?: string }> {
  const me = await getCurrentUser();
  if (!me || !["super_admin", "owner", "admin"].includes(me.role)) return { ok: false, error: "Not authorised." };
  if (me.id === userId) return { ok: false, error: "You cannot remove your own account." };
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Admin not configured." };
  await admin.from("employees").delete().eq("profile_id", userId);
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/users");
  revalidatePath("/employees");
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
