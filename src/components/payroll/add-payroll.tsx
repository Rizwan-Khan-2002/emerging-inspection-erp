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
import { payrollSchema, type PayrollFormValues } from "@/lib/validations/entities";
import { createPayroll } from "@/lib/actions/entities";

export function AddPayroll({ employees }: { employees: { id: string; full_name: string; basic_salary: number }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const EMPTY: PayrollFormValues = { employee_id: "", period: "", basic_salary: 0, ot_amount: 0, allowances: 0, deductions: 0, status: "draft" };
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<PayrollFormValues>({ resolver: zodResolver(payrollSchema) as Resolver<PayrollFormValues>, defaultValues: EMPTY });

  const net = (Number(watch("basic_salary")) || 0) + (Number(watch("ot_amount")) || 0) + (Number(watch("allowances")) || 0) - (Number(watch("deductions")) || 0);

  function onSubmit(v: PayrollFormValues) {
    setErr(null);
    start(async () => {
      const res = await createPayroll(v);
      if (!res.ok) { setErr(res.error ?? "Failed"); return; }
      setOpen(false); reset(EMPTY); router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) reset(EMPTY); }}>
      <DialogTrigger asChild><Button><Plus /> Generate Payroll</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Generate Payroll</DialogTitle><DialogDescription>Net = Basic + OT + Allowances − Deductions.</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Employee</Label>
              <Select value={watch("employee_id")} onValueChange={(v) => {
                setValue("employee_id", v);
                const e = employees.find((x) => x.id === v);
                if (e) setValue("basic_salary", e.basic_salary);
              }}>
                <SelectTrigger><SelectValue placeholder={employees.length ? "Select" : "Add employees first"} /></SelectTrigger>
                <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}</SelectContent>
              </Select>
              {errors.employee_id && <p className="text-xs text-danger">{errors.employee_id.message}</p>}
            </div>
            <div className="space-y-1.5"><Label>Period (YYYY-MM)</Label><Input {...register("period")} placeholder="2026-06" /></div>
            <div className="space-y-1.5"><Label>Basic Salary</Label><Input type="number" {...register("basic_salary")} /></div>
            <div className="space-y-1.5"><Label>Overtime</Label><Input type="number" {...register("ot_amount")} /></div>
            <div className="space-y-1.5"><Label>Allowances</Label><Input type="number" {...register("allowances")} /></div>
            <div className="space-y-1.5"><Label>Deductions</Label><Input type="number" {...register("deductions")} /></div>
          </div>
          <div className="flex justify-between rounded-md border border-border bg-navy-700 p-3 text-sm font-semibold">
            <span>Net Salary</span><span className="text-accent">{net.toFixed(2)} SAR</span>
          </div>
          {err && <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{err}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending && <Loader2 className="animate-spin" />} Generate</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
