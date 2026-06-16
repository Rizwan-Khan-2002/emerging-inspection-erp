"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { setInspectionStatus } from "@/lib/actions/inspections";
import { JOB_STATUS } from "@/lib/constants";
import type { JobStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const FLOW: JobStatus[] = [
  "pending", "assigned", "in_progress", "submitted", "under_review", "approved", "sent_to_client", "closed",
];

export function StatusWorkflow({ inspectionId, initial }: { inspectionId: string; initial: JobStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState<JobStatus>(initial);
  const [pending, start] = useTransition();
  const idx = FLOW.indexOf(status);
  const next = FLOW[idx + 1];

  function change(s: JobStatus) {
    const prev = status;
    setStatus(s); // optimistic
    start(async () => {
      const res = await setInspectionStatus(inspectionId, s);
      if (!res.ok) { setStatus(prev); alert(res.error ?? "Could not update status"); return; }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-steel-dim">Current status</span>
          <StatusBadge status={JOB_STATUS[status]} />
          {pending && <Loader2 className="size-3.5 animate-spin text-steel-dim" />}
        </div>
        {next && (
          <Button size="sm" disabled={pending} onClick={() => change(next)}>
            Advance to {JOB_STATUS[next].label} <ArrowRight />
          </Button>
        )}
      </div>

      <ol className="flex flex-wrap gap-x-1 gap-y-2">
        {FLOW.map((s, i) => {
          const done = i < idx;
          const current = i === idx;
          return (
            <li key={s} className="flex items-center gap-1">
              <button
                type="button"
                disabled={pending}
                onClick={() => change(s)}
                title={`Set status to ${JOB_STATUS[s].label}`}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-60",
                  current && "border-accent bg-accent/15 text-accent",
                  done && "border-success/40 bg-success/10 text-success",
                  !done && !current && "border-border bg-navy-700 text-steel-dim hover:border-accent/50 hover:text-foreground"
                )}
              >
                {done ? <Check className="size-3" /> : <span className="size-1.5 rounded-full bg-current" />}
                {JOB_STATUS[s].label}
              </button>
              {i < FLOW.length - 1 && <ArrowRight className="size-3 text-steel-dim" />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
