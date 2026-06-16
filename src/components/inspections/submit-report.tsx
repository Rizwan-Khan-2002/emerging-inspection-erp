"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitReport } from "@/lib/actions/reports";

export function SubmitReport({ inspectionId }: { inspectionId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);

  return (
    <Button
      variant="secondary"
      disabled={pending || done}
      onClick={() => start(async () => {
        const res = await submitReport(inspectionId);
        if (!res.ok) { alert(res.error ?? "Failed"); return; }
        setDone(true);
        router.refresh();
      })}
    >
      {pending ? <Loader2 className="animate-spin" /> : done ? <Check className="text-success" /> : <FileUp />}
      {done ? "Report Submitted" : "Submit Report"}
    </Button>
  );
}
