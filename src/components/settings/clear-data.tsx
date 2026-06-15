"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { clearSampleData } from "@/lib/actions/admin";

type Line = { table: string; count?: number; error?: string };

function parse(report: string): Line[] {
  return report.split("\n").map((l) => {
    const [table, rest] = l.split(":").map((s) => s.trim());
    if (rest?.startsWith("ERROR")) return { table, error: rest.replace(/^ERROR\s*—?\s*/, "") };
    const m = rest?.match(/deleted (\d+)/);
    return { table, count: m ? Number(m[1]) : 0 };
  });
}

export function ClearData() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [result, setResult] = useState<Line[] | null>(null);

  const totalDeleted = result?.reduce((s, l) => s + (l.count ?? 0), 0) ?? 0;
  const errors = result?.filter((l) => l.error) ?? [];

  function run() {
    start(async () => {
      const res = await clearSampleData();
      if (!res.ok) { setResult([{ table: "auth", error: res.error ?? "Failed" }]); return; }
      setResult(res.report ? parse(res.report) : []);
      router.refresh();
    });
  }

  return (
    <Card className="border-danger/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-danger"><Trash2 className="size-4" /> Danger Zone</CardTitle>
        <p className="text-sm text-muted">Remove all sample / demo records so you can start with your own real data. This cannot be undone.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setResult(null); }}>
          <DialogTrigger asChild>
            <Button variant="danger"><Trash2 /> Clear all sample data</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            {!result ? (
              <>
                <DialogHeader>
                  <DialogTitle>Clear all sample data?</DialogTitle>
                  <DialogDescription>
                    This permanently deletes all leads, clients, employees, vehicles, inspections, reports and other records.
                    Your user accounts and login are NOT affected.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button variant="danger" disabled={pending} onClick={run}>
                    {pending && <Loader2 className="animate-spin" />} Yes, clear everything
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {errors.length === 0
                      ? <><Check className="size-5 text-success" /> Cleanup complete</>
                      : <><AlertTriangle className="size-5 text-warning" /> Cleanup finished with notes</>}
                  </DialogTitle>
                  <DialogDescription>{totalDeleted} record(s) removed across {result.length} tables.</DialogDescription>
                </DialogHeader>
                <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-border bg-navy-700 p-2">
                  {result.map((l) => (
                    <div key={l.table} className="flex items-center justify-between rounded px-2 py-1 text-sm">
                      <span className="text-steel">{l.table}</span>
                      {l.error
                        ? <span className="max-w-[60%] truncate text-xs text-danger" title={l.error}>⚠ {l.error}</span>
                        : <span className="text-success">{l.count} deleted</span>}
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <Button onClick={() => { setOpen(false); setResult(null); }}>Done</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
