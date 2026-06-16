"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { notify, notifyOps } from "./notifications";
import type { ReportStatus } from "@/lib/types";

/** Inspector / coordinator submits a report for an inspection → goes to coordinator review. */
export async function submitReport(inspectionId: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: true };
  const sb = await createClient();
  const user = await getCurrentUser();
  if (!sb) return { ok: false, error: "No database connection." };

  // Avoid duplicate open reports for the same inspection.
  const { data: existing } = await sb.from("reports").select("id").eq("inspection_id", inspectionId).limit(1);
  if (existing && existing.length) {
    return { ok: false, error: "A report already exists for this inspection." };
  }

  const { error } = await sb.from("reports").insert({
    inspection_id: inspectionId,
    status: "pending_review",
    summary: null,
    submitted_by: user?.id ?? null,
    submitted_at: new Date().toISOString(),
  });
  if (error) return { ok: false, error: error.message };

  await sb.from("inspections").update({ status: "submitted" }).eq("id", inspectionId);
  await notifyOps({ title: "Report submitted for review", body: `By ${user?.full_name ?? "inspector"}`, type: "warning" });
  revalidatePath("/reports");
  revalidatePath("/inspections");
  return { ok: true };
}

/** Coordinator / admin moves a report through its workflow. */
export async function setReportStatus(
  reportId: string, status: ReportStatus
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: true };
  const me = await getCurrentUser();
  if (!me || !["super_admin", "owner", "admin", "coordinator"].includes(me.role)) {
    return { ok: false, error: "Not authorised to review reports." };
  }
  const sb = await createClient();
  if (!sb) return { ok: false, error: "No database connection." };

  const { error } = await sb.from("reports").update({ status, reviewed_by: me.id }).eq("id", reportId);
  if (error) return { ok: false, error: error.message };

  if (status === "sent_to_client") {
    await notify(["client"], { title: "New inspection report available", body: "A report has been shared with you.", type: "info" });
  }
  revalidatePath("/reports");
  return { ok: true };
}
