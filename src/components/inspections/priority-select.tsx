"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setInspectionPriority } from "@/lib/actions/inspections";
import { PRIORITY } from "@/lib/constants";
import type { Priority } from "@/lib/types";

export function PrioritySelect({ inspectionId, initial }: { inspectionId: string; initial: Priority }) {
  const router = useRouter();
  const [value, setValue] = useState<Priority>(initial);
  const [pending, start] = useTransition();

  function change(v: Priority) {
    const prev = value;
    setValue(v);
    start(async () => {
      const res = await setInspectionPriority(inspectionId, v);
      if (!res.ok) { setValue(prev); alert(res.error ?? "Could not update priority"); return; }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={(v) => change(v as Priority)}>
        <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
        <SelectContent>
          {Object.entries(PRIORITY).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
        </SelectContent>
      </Select>
      {pending && <Loader2 className="size-4 animate-spin text-steel-dim" />}
    </div>
  );
}
