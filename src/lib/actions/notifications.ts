"use server";

import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { NotificationItem, Role } from "@/lib/types";

/** Current user's notifications (RLS scopes to user_id = auth.uid()). */
export async function fetchMyNotifications(): Promise<NotificationItem[]> {
  if (!isSupabaseConfigured) return [];
  const sb = await createClient();
  if (!sb) return [];
  const { data } = await sb
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);
  return (data ?? []) as NotificationItem[];
}

export async function markNotificationRead(id: string) {
  const sb = await createClient();
  if (sb) await sb.from("notifications").update({ read: true }).eq("id", id);
}

export async function markAllNotificationsRead() {
  const sb = await createClient();
  if (sb) await sb.from("notifications").update({ read: true }).eq("read", false);
}

export async function dismissNotification(id: string) {
  const sb = await createClient();
  if (sb) await sb.from("notifications").delete().eq("id", id);
}

export async function clearNotifications() {
  const sb = await createClient();
  if (sb) await sb.from("notifications").delete().not("id", "is", null);
}

/**
 * Create a notification for every user with one of the given roles.
 * Uses the service-role admin client so it can write to other users' rows.
 */
export async function notify(
  roles: Role[],
  n: { title: string; body?: string; type?: "info" | "success" | "warning" | "danger" }
) {
  if (!isSupabaseConfigured) return;
  const admin = createAdminClient();
  if (!admin) return;
  const { data: users } = await admin.from("profiles").select("id").in("role", roles);
  if (!users?.length) return;
  const rows = users.map((u) => ({
    user_id: u.id,
    title: n.title,
    body: n.body ?? null,
    type: n.type ?? "info",
    read: false,
  }));
  await admin.from("notifications").insert(rows);
}

/** Convenience: notify management (super_admin, owner, admin) + coordinator. */
export async function notifyOps(n: { title: string; body?: string; type?: "info" | "success" | "warning" | "danger" }) {
  await notify(["super_admin", "owner", "admin", "coordinator"], n);
}

/** So actions in other files can reference the actor without re-importing auth. */
export async function actorName() {
  const u = await getCurrentUser();
  return u?.full_name ?? "Someone";
}
