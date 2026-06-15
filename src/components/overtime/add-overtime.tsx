"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { overtimeSchema, type OvertimeFormValues } from "@/lib/validations/entities";
import { createOvertime } from "@/lib/actions/entities";

const EMPTY: OvertimeFormValues = { employee_id: "", date: "", start_time: "", end_time: "", total_hours: 0 };

export function AddOvertime({ employees }: { employees: { id: string; full_name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<OvertimeFormValues>({ resolver: zodResolver(overtimeSchema) as Resolver<OvertimeFormValues>, defaultValues: EMPTY });

  const ot = Math.max((Number(watch("total_hours")) || 0) - 8, 0);

  function onSubmit(v: OvertimeFormValues) {
    setErr(null);
    start(async () => {
      const res = await createOvertime(v);
      if (!res.ok) { setErr(res.error ?? "Failed"); return; }
      setOpen(false); reset(EMPTY); router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) reset(EMPTY); }}>
      <DialogTrigger asChild><Button><Plus /> Add Overtime</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Add Overtime</DialogTitle><DialogDescription>OT = Total hours − 8 standard hours.</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Employee</Label>
              <Select value={watch("employee_id")} onValueChange={(v) => setValue("employee_id", v)}>
                <SelectTrigger><SelectValue placeholder={employees.length ? "Select" : "Add employees first"} /></SelectTrigger>
                <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}</SelectContent>
              </Select>
              {errors.employee_id && <p className="text-xs text-danger">{errors.employee_id.message}</p>}
            </div>
            <div className="space-y-1.5"><Label>Date</Label><Input type="date" {...register("date")} /></div>
            <div className="space-y-1.5"><Label>Start Time</Label><Input type="time" {...register("start_time")} /></div>
            <div className="space-y-1.5"><Label>End Time</Label><Input type="time" {...register("end_time")} /></div>
            <div className="space-y-1.5"><Label>Total Hours</Label><Input type="number" step="0.5" {...register("total_hours")} /></div>
          </div>
          <div className="flex justify-between rounded-md border border-border bg-navy-700 p-3 text-sm font-semibold">
            <span>Overtime Hours</span><span className="text-accent">{ot.toFixed(1)} h</span>
          </div>
          {err && <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{err}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending && <Loader2 className="animate-spin" />} Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
