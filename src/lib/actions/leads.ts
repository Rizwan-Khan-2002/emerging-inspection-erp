"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Lead } from "@/lib/types";
import type { LeadFormValues } from "@/lib/validations/lead";

type Result = { data?: Lead; error?: string };

/** Create a lead. Persists to Supabase when configured; otherwise returns a demo row. */
export async function createLead(values: LeadFormValues): Promise<Result> {
  const payload = {
    ...values,
    follow_up_date: values.follow_up_date || null,
  };

  if (isSupabaseConfigured) {
    const sb = await createClient();
    const user = await getCurrentUser();
    if (sb) {
      const { data, error } = await sb
        .from("leads")
        .insert({ ...payload, owner_id: user?.id ?? null })
        .select("*")
        .single();
      if (error) return { error: error.message };
      revalidatePath("/leads");
      return { data: data as Lead };
    }
  }

  // Demo fallback
  const now = new Date().toISOString();
  return {
    data: {
      id: `L-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      ...payload,
      created_at: now,
      updated_at: now,
    } as Lead,
  };
}

/** Bulk-import leads from parsed spreadsheet rows. */
export async function importLeads(
  rows: Record<string, unknown>[]
): Promise<{ ok: boolean; count: number; error?: string }> {
  const norm = (k: string) => k.trim().toLowerCase().replace(/[\s-]+/g, "_");
  const sources = ["website", "referral", "linkedin", "cold_email", "exhibition", "whatsapp", "other"];
  const statuses = ["new", "contacted", "follow_up", "interested", "quotation_sent", "negotiation", "won", "lost"];

  const payload = rows
    .map((r) => {
      const o: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(r)) o[norm(k)] = v;
      const source = norm(String(o.source ?? o.lead_source ?? "other"));
      const status = norm(String(o.status ?? o.lead_status ?? "new"));
      return {
        company_name: String(o.company_name ?? o.company ?? "").trim(),
        industry: o.industry ? String(o.industry) : null,
        contact_person: String(o.contact_person ?? o.contact ?? "—").trim() || "—",
        position: o.position ? String(o.position) : null,
        email: o.email ? String(o.email) : null,
        phone: o.phone ? String(o.phone) : null,
        whatsapp: o.whatsapp ? String(o.whatsapp) : null,
        country: o.country ? String(o.country) : "Saudi Arabia",
        city: o.city ? String(o.city) : null,
        source: sources.includes(source) ? source : "other",
        status: statuses.includes(status) ? status : "new",
        estimated_value: o.estimated_value ? Number(o.estimated_value) || 0 : 0,
        notes: o.notes ? String(o.notes) : null,
      };
    })
    .filter((l) => l.company_name);

  if (payload.length === 0) {
    return { ok: false, count: 0, error: "No valid rows found. Make sure there is a 'company_name' column." };
  }

  if (!isSupabaseConfigured) return { ok: true, count: payload.length };
  const sb = await createClient();
  const user = await getCurrentUser();
  if (!sb) return { ok: false, count: 0, error: "No database connection." };

  const { error } = await sb.from("leads").insert(payload.map((p) => ({ ...p, owner_id: user?.id ?? null })));
  if (error) return { ok: false, count: 0, error: error.message };
  revalidatePath("/leads");
  return { ok: true, count: payload.length };
}

/** Update an existing lead. */
export async function updateLead(id: string, values: LeadFormValues): Promise<Result> {
  const payload = {
    ...values,
    follow_up_date: values.follow_up_date || null,
  };

  if (isSupabaseConfigured) {
    const sb = await createClient();
    if (sb) {
      const { data, error } = await sb
        .from("leads")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();
      if (error) return { error: error.message };
      revalidatePath("/leads");
      return { data: data as Lead };
    }
  }

  return { data: { id, ...payload, updated_at: new Date().toISOString() } as Lead };
}
