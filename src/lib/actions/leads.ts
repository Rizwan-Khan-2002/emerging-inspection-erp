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
