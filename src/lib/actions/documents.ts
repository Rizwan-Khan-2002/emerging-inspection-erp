"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function createDocument(
  name: string, file_url: string, expiry_date?: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: true };
  const sb = await createClient();
  if (!sb) return { ok: false, error: "No database connection." };
  const { error } = await sb.from("documents").insert({
    name, file_url, expiry_date: expiry_date || null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/documents");
  return { ok: true };
}

export async function deleteDocument(id: string) {
  if (!isSupabaseConfigured) return;
  const sb = await createClient();
  if (sb) await sb.from("documents").delete().eq("id", id);
  revalidatePath("/documents");
}
