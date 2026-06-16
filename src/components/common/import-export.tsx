"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileDown, FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToExcel, parseExcelFile } from "@/lib/excel";

type ImportResult = { ok: boolean; count: number; error?: string };

export function ImportExport({
  rows, filename, sheet, importAction,
}: {
  rows: Record<string, unknown>[];
  filename: string;
  sheet?: string;
  importAction?: (rows: Record<string, unknown>[]) => Promise<ImportResult>;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !importAction) return;
    start(async () => {
      try {
        const parsed = await parseExcelFile(file);
        const res = await importAction(parsed);
        if (!res.ok) { alert(res.error ?? "Import failed"); return; }
        alert(`✅ Imported ${res.count} record(s).`);
        router.refresh();
      } catch {
        alert("Could not read the file. Use a .xlsx or .csv file.");
      } finally {
        if (fileRef.current) fileRef.current.value = "";
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {importAction && (
        <>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onFile} />
          <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <FileUp />} Import
          </Button>
        </>
      )}
      <Button variant="secondary" onClick={() => exportToExcel(rows, filename, sheet)} disabled={!rows.length}>
        <FileDown /> Export
      </Button>
    </div>
  );
}
