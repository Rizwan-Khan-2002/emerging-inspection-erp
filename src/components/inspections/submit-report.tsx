"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitReport } from "@/lib/actions/reports";

export function SubmitReport({ inspectionId }: { inspectionId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  return (
    <div className="relative">
      <Button
        variant="secondary"
        disabled={pending || done}
        onClick={() => start(async () => {
          setNote(null);
          const res = await submitReport(inspectionId);
          if (!res.ok) { setNote(res.error ?? "Could not submit report"); return; }
          setDone(true);
          router.refresh();
        })}
      >
        {pending ? <Loader2 className="animate-spin" /> : done ? <Check className="text-success" /> : <FileUp />}
        {done ? "Report Submitted" : "Submit Report"}
      </Button>
      {(note || done) && (
        <p className={`absolute inset-x-0 top-full mt-1 flex items-center gap-1 text-xs ${done ? "text-success" : "text-warning"}`}>
          {done ? <Check className="size-3 shrink-0" /> : <AlertCircle className="size-3 shrink-0" />}
          {done ? "Sent to coordinator for review" : note}
        </p>
      )}
    </div>
  );
}
