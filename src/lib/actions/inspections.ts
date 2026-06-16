"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { InspectionFormValues } from "@/lib/validations/inspection";
import { notifyOps } from "./notifications";

export async function createInspection(
  v: InspectionFormValues
): Promise<{ ok: boolean; error?: string; ref?: string }> {
  const ref = `INS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  if (!isSupabaseConfigured) return { ok: true, ref };

  const sb = await createClient();
  if (!sb) return { ok: false, error: "No database connection." };

  const { error } = await sb.from("inspections").insert({
    ref,
    type: v.type,
    client_id: v.client_id,
    site_location: v.site_location,
    scheduled_at: v.scheduled_at,
    priority: v.priority,
    status: v.status,
    lat: v.lat ?? null,
    lng: v.lng ?? null,
    remarks: v.remarks || null,
  });
  if (error) return { ok: false, error: error.message };
  await notifyOps({ title: "New inspection scheduled", body: ref, type: "info" });
  revalidatePath("/inspections");
  return { ok: true, ref };
}
