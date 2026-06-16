"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { CompanyFormValues } from "@/lib/validations/entities";

/** Save the uploaded company logo URL (needs company_settings.logo_url column). */
export async function updateCompanyLogo(logo_url: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: true };
  const sb = await createClient();
  if (!sb) return { ok: false, error: "No database connection." };
  const { error } = await sb.from("company_settings").update({ logo_url }).eq("id", 1);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateCompanySettings(v: CompanyFormValues): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: true };
  const sb = await createClient();
  if (!sb) return { ok: false, error: "No database connection." };
  const { error } = await sb
    .from("company_settings")
    .upsert({ id: 1, ...v, email: v.email || null });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings");
  return { ok: true };
}
