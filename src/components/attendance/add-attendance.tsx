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
import { attendanceSchema, type AttendanceFormValues } from "@/lib/validations/entities";
import { createAttendance } from "@/lib/actions/entities";

const STATUSES = [
  { v: "present", label: "Present" },
  { v: "night_shift", label: "Night Shift" },
  { v: "half_day", label: "Half Day" },
  { v: "leave", label: "Leave" },
  { v: "absent", label: "Absent" },
] as const;

export function AddAttendance({ employees }: { employees: { id: string; full_name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const EMPTY: AttendanceFormValues = {
    employee_id: "", date: "", status: "present", check_in: "", check_out: "", total_hours: 0, late_minutes: 0,
  };
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<AttendanceFormValues>({ resolver: zodResolver(attendanceSchema) as Resolver<AttendanceFormValues>, defaultValues: EMPTY });

  const status = watch("status");
  const needsTimes = status === "present" || status === "night_shift" || status === "half_day";

  function onSubmit(v: AttendanceFormValues) {
    setErr(null);
    start(async () => {
      const res = await createAttendance(v);
      if (!res.ok) { setErr(res.error ?? "Failed"); return; }
      setOpen(false); reset(EMPTY); router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) reset(EMPTY); }}>
      <DialogTrigger asChild><Button><Plus /> Mark Attendance</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Mark Attendance</DialogTitle>
          <DialogDescription>Record attendance manually — one entry per employee per day (re-marking updates it).</DialogDescription>
        </DialogHeader>
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
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" {...register("date")} />
              {errors.date && <p className="text-xs text-danger">{errors.date.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setValue("status", v as AttendanceFormValues["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s.v} value={s.v}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Late (minutes)</Label><Input type="number" {...register("late_minutes")} /></div>
            {needsTimes && (
              <>
                <div className="space-y-1.5"><Label>Check In</Label><Input type="time" {...register("check_in")} /></div>
                <div className="space-y-1.5"><Label>Check Out</Label><Input type="time" {...register("check_out")} /></div>
                <div className="space-y-1.5"><Label>Total Hours</Label><Input type="number" step="0.5" {...register("total_hours")} /></div>
              </>
            )}
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
