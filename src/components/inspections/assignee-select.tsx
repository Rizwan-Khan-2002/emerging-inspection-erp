"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setInspectionAssignee } from "@/lib/actions/inspections";

export function AssigneeSelect({
  inspectionId, field, initial, options, placeholder,
}: {
  inspectionId: string;
  field: "inspector_id" | "coordinator_id";
  initial?: string | null;
  options: { id: string; full_name: string; role?: string }[];
  placeholder: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState<string>(initial ?? "none");
  const [pending, start] = useTransition();

  function change(v: string) {
    const prev = value;
    setValue(v);
    start(async () => {
      const res = await setInspectionAssignee(inspectionId, field, v === "none" ? null : v);
      if (!res.ok) { setValue(prev); alert(res.error ?? "Could not assign"); return; }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={change}>
        <SelectTrigger className="h-9 w-full"><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="none">— Unassigned —</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.full_name}{o.role ? ` · ${o.role}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {pending && <Loader2 className="size-4 shrink-0 animate-spin text-steel-dim" />}
    </div>
  );
}
