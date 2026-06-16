"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, Loader2, X } from "lucide-react";
import { addInspectionPhoto, removeInspectionPhoto } from "@/lib/actions/inspections";

export function SitePhotos({
  inspectionId, initial,
}: {
  inspectionId: string;
  initial: string[];
}) {
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>(initial ?? []);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [, start] = useTransition();

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "inspections");
        const r = await fetch("/api/upload", { method: "POST", body: fd });
        const d = await r.json();
        if (!r.ok) { alert(d.error ?? "Upload failed"); continue; }
        const sv = await addInspectionPhoto(inspectionId, d.url);
        if (!sv.ok) { alert(sv.error ?? "Could not save photo"); continue; }
        setPhotos((p) => [...p, d.url]);
      }
      router.refresh();
    } catch {
      alert("Photo upload error.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(url: string) {
    start(async () => {
      const sv = await removeInspectionPhoto(inspectionId, url);
      if (!sv.ok) { alert(sv.error ?? "Could not remove photo"); return; }
      setPhotos((p) => p.filter((u) => u !== url));
      router.refresh();
    });
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {/* Upload tile */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-navy-700 text-steel-dim transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
        >
          {uploading ? <Loader2 className="size-5 animate-spin" /> : <Camera className="size-5" />}
          <span className="text-[10px] font-medium">{uploading ? "Uploading…" : "Add photo"}</span>
        </button>

        {photos.map((url) => (
          <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-navy-700">
            <Image src={url} alt="Site photo" fill sizes="120px" className="object-cover" unoptimized />
            <button
              type="button"
              onClick={() => remove(url)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-danger group-hover:opacity-100"
              aria-label="Remove photo"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-steel-dim">
        {photos.length > 0
          ? `${photos.length} photo${photos.length > 1 ? "s" : ""} uploaded — stored in Supabase Storage.`
          : "Upload JPG/PNG site photos — stored securely in Supabase Storage."}
      </p>
    </>
  );
}
