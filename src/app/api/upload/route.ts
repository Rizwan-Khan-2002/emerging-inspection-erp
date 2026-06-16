import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** Upload a file to the 'files' storage bucket (service-role; bypasses RLS). */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Storage not configured" }, { status: 503 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const folder = String(form.get("folder") ?? "documents").replace(/[^a-z0-9_-]/gi, "");
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });

  const ext = (file.name.split(".").pop() ?? "bin").toLowerCase();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage.from("files").upload(path, buf, {
    contentType: file.type || "application/octet-stream",
    upsert: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = admin.storage.from("files").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, name: file.name, path });
}
