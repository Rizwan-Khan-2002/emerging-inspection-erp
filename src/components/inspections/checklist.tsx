"use client";

import { useState, useTransition } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateInspectionChecklist } from "@/lib/actions/inspections";
import { cn, shortId } from "@/lib/utils";
import type { ChecklistItem } from "@/lib/types";

const RESULTS: { key: ChecklistItem["result"]; label: string; cls: string }[] = [
  { key: "pass", label: "Pass", cls: "data-[on=true]:bg-success data-[on=true]:text-navy" },
  { key: "fail", label: "Fail", cls: "data-[on=true]:bg-danger data-[on=true]:text-white" },
  { key: "na", label: "N/A", cls: "data-[on=true]:bg-steel-dim data-[on=true]:text-navy" },
];

export function Checklist({ inspectionId, initial }: { inspectionId: string; initial: ChecklistItem[] }) {
  const [items, setItems] = useState<ChecklistItem[]>(initial);
  const [draft, setDraft] = useState("");
  const [saving, start] = useTransition();

  // Optimistically update local state, then persist the full list to the DB.
  function commit(next: ChecklistItem[]) {
    setItems(next);
    start(async () => { await updateInspectionChecklist(inspectionId, next); });
  }

  function setResult(id: string, result: ChecklistItem["result"]) {
    commit(items.map((i) => (i.id === id ? { ...i, result } : i)));
  }
  function remove(id: string) {
    commit(items.filter((i) => i.id !== id));
  }
  function add() {
    if (!draft.trim()) return;
    commit([...items, { id: shortId("c-"), label: draft.trim(), result: "pending" }]);
    setDraft("");
  }

  const passed = items.filter((i) => i.result === "pass").length;
  const failed = items.filter((i) => i.result === "fail").length;

  return (
    <div className="space-y-4">
      {items.length > 0 && (
        <div className="flex items-center gap-4 text-xs">
          <span className="text-success">{passed} passed</span>
          <span className="text-danger">{failed} failed</span>
          <span className="text-steel-dim">{items.length} total</span>
          {saving && <Loader2 className="size-3 animate-spin text-steel-dim" />}
        </div>
      )}

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col gap-2 rounded-lg border border-border bg-navy-700 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium">{item.label}</p>
              {item.note && <p className="text-xs text-danger">{item.note}</p>}
            </div>
            <div className="flex items-center gap-1">
              {RESULTS.map((r) => (
                <button
                  key={r.key}
                  data-on={item.result === r.key}
                  onClick={() => setResult(item.id, r.key)}
                  className={cn(
                    "rounded-md border border-border px-3 py-1 text-xs font-medium text-steel transition-colors hover:bg-card-hover",
                    r.cls
                  )}
                >
                  {r.label}
                </button>
              ))}
              <button
                onClick={() => remove(item.id)}
                title="Remove item"
                className="ml-1 rounded-md p-1.5 text-steel-dim transition-colors hover:bg-danger/15 hover:text-danger"
              >
                <X className="size-4" />
              </button>
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-steel-dim">
            No checklist items yet. Add the first one below.
          </li>
        )}
      </ul>

      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add checklist item…"
        />
        <Button variant="secondary" onClick={add}><Plus /> Add</Button>
      </div>
    </div>
  );
}
