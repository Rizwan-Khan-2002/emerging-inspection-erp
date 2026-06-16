"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, BadgeCheck, Loader2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setPayrollStatus } from "@/lib/actions/entities";

export function PayrollActions({ id, status }: { id: string; status: "draft" | "approved" | "paid" }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function go(s: "draft" | "approved" | "paid") {
    start(async () => {
      const res = await setPayrollStatus(id, s);
      if (!res.ok) { alert(res.error ?? "Failed"); return; }
      router.refresh();
    });
  }

  return (
    <div className="flex justify-end gap-1">
      {status === "draft" && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => go("approved")}>
          {pending ? <Loader2 className="animate-spin" /> : <Check />} Approve
        </Button>
      )}
      {status === "approved" && (
        <>
          <Button size="sm" variant="success" disabled={pending} onClick={() => go("paid")}>
            {pending ? <Loader2 className="animate-spin" /> : <BadgeCheck />} Mark Paid
          </Button>
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => go("draft")} title="Revert to draft">
            <Undo2 />
          </Button>
        </>
      )}
      {status === "paid" && <span className="text-xs text-success">Paid ✓</span>}
    </div>
  );
}
