"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export interface LeadActivity {
  id: string;
  lead_id: string;
  type: string;            // note | call | email | whatsapp
  subject?: string | null;
  body?: string | null;
  created_at: string;
}

/** All activity/history entries for a lead, newest first. */
export async function getLeadActivities(leadId: string): Promise<LeadActivity[]> {
  if (!isSupabaseConfigured) return [];
  const sb = await createClient();
  if (!sb) return [];
  const { data } = await sb
    .from("lead_activities")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  return (data ?? []) as LeadActivity[];
}

/** Log a contact/note against a lead. */
export async function logLeadActivity(
  leadId: string, type: string, subject?: string, body?: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: true };
  const sb = await createClient();
  if (!sb) return { ok: false, error: "No database connection." };
  const user = await getCurrentUser();
  const { error } = await sb.from("lead_activities").insert({
    lead_id: leadId,
    type,
    subject: subject ?? null,
    body: body ?? null,
    created_by: user?.id ?? null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/leads");
  return { ok: true };
}
