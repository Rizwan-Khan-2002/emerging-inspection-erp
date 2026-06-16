"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createDocument, deleteDocument } from "@/lib/actions/documents";

export function DocumentUpload() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPending(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "documents");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "Upload failed"); return; }
      const cr = await createDocument(file.name, data.url);
      if (!cr.ok) { alert(cr.error ?? "Save failed"); return; }
      router.refresh();
    } catch {
      alert("Upload error. Try again.");
    } finally {
      setPending(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <>
      <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xlsx,.csv" className="hidden" onChange={onFile} />
      <Button onClick={() => fileRef.current?.click()} disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Upload />} {pending ? "Uploading…" : "Upload Document"}
      </Button>
    </>
  );
}

export function DeleteDocButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <Button
      variant="ghost" size="icon-sm" disabled={pending}
      onClick={async () => { setPending(true); await deleteDocument(id); router.refresh(); }}
      className="text-steel-dim hover:text-danger"
    >
      {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}
    </Button>
  );
}
