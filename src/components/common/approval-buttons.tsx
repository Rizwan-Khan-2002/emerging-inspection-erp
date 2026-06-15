"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setApproval } from "@/lib/actions/entities";

export function ApprovalButtons({ table, id }: { table: "overtime" | "fuel_expenses" | "expense_claims"; id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function act(approval: "approved" | "rejected") {
    start(async () => {
      const res = await setApproval(table, id, approval);
      if (!res.ok) alert(res.error ?? "Failed");
      router.refresh();
    });
  }

  return (
    <div className="flex justify-end gap-1">
      <Button size="icon-sm" variant="success" disabled={pending} onClick={() => act("approved")}><Check /></Button>
      <Button size="icon-sm" variant="danger" disabled={pending} onClick={() => act("rejected")}><X /></Button>
    </div>
  );
}
