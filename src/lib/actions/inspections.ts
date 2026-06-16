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
    client_id: v.client_id || null,
    project_id: v.project_id || null,
    site_location: v.site_location,
    scheduled_at: v.scheduled_at,
    priority: v.priority,
    status: v.status,
    approval_type: v.approval_type || null,
    qm_type: v.qm_type || null,
    material: v.material || null,
    lat: v.lat ?? null,
    lng: v.lng ?? null,
    remarks: v.remarks || null,
  });
  if (error) return { ok: false, error: error.message };
  await notifyOps({ title: "New inspection scheduled", body: ref, type: "info" });
  revalidatePath("/inspections");
  return { ok: true, ref };
}

/** Update an inspection's job status (persists + revalidates). */
export async function setInspectionStatus(
  id: string, status: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: true };
  const sb = await createClient();
  if (!sb) return { ok: false, error: "No database connection." };
  const { error } = await sb.from("inspections").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/inspections/${id}`);
  revalidatePath("/inspections");
  return { ok: true };
}

/** Update an inspection's priority (persists + revalidates). */
export async function setInspectionPriority(
  id: string, priority: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: true };
  const sb = await createClient();
  if (!sb) return { ok: false, error: "No database connection." };
  const { error } = await sb.from("inspections").update({ priority }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/inspections/${id}`);
  revalidatePath("/inspections");
  return { ok: true };
}

/** Append an uploaded site-photo URL to an inspection's photos array. */
export async function addInspectionPhoto(
  id: string, url: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: true };
  const sb = await createClient();
  if (!sb) return { ok: false, error: "No database connection." };
  const { data, error: readErr } = await sb.from("inspections").select("photos").eq("id", id).single();
  if (readErr) return { ok: false, error: readErr.message };
  const photos = Array.isArray(data?.photos) ? (data.photos as string[]) : [];
  const { error } = await sb.from("inspections").update({ photos: [...photos, url] }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/inspections/${id}`);
  return { ok: true };
}

/** Remove a site-photo URL from an inspection's photos array. */
export async function removeInspectionPhoto(
  id: string, url: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: true };
  const sb = await createClient();
  if (!sb) return { ok: false, error: "No database connection." };
  const { data, error: readErr } = await sb.from("inspections").select("photos").eq("id", id).single();
  if (readErr) return { ok: false, error: readErr.message };
  const photos = Array.isArray(data?.photos) ? (data.photos as string[]) : [];
  const { error } = await sb.from("inspections").update({ photos: photos.filter((u) => u !== url) }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/inspections/${id}`);
  return { ok: true };
}
