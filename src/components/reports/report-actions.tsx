"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, RotateCcw, Send, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setReportStatus } from "@/lib/actions/reports";
import type { ReportStatus } from "@/lib/types";

export function ReportActions({
  reportId, status, canManage,
}: {
  reportId: string;
  status: ReportStatus;
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function go(s: ReportStatus) {
    start(async () => {
      const res = await setReportStatus(reportId, s);
      if (!res.ok) { alert(res.error ?? "Failed"); return; }
      router.refresh();
    });
  }

  if (!canManage) return <span className="text-xs text-steel-dim">—</span>;

  return (
    <div className="flex justify-end gap-1">
      {(status === "pending_review" || status === "submitted") && (
        <>
          <Button size="sm" variant="success" disabled={pending} onClick={() => go("approved")}>
            {pending ? <Loader2 className="animate-spin" /> : <Check />} Approve
          </Button>
          <Button size="sm" variant="outline" className="border-warning/40 text-warning" disabled={pending} onClick={() => go("needs_correction")}>
            <RotateCcw /> Return
          </Button>
        </>
      )}
      {status === "approved" && (
        <Button size="sm" disabled={pending} onClick={() => go("sent_to_client")}>
          {pending ? <Loader2 className="animate-spin" /> : <Send />} Send to Client
        </Button>
      )}
      {status === "sent_to_client" && (
        <Button size="sm" variant="secondary" disabled={pending} onClick={() => go("closed")}>
          <Lock /> Close
        </Button>
      )}
      {(status === "needs_correction" || status === "closed" || status === "draft") && (
        <span className="text-xs text-steel-dim">No action</span>
      )}
    </div>
  );
}
