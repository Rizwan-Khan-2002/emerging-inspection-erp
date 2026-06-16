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
import { employeeSchema, type EmployeeFormValues } from "@/lib/validations/entities";
import { createEmployee } from "@/lib/actions/entities";

const EMPTY: EmployeeFormValues = {
  employee_code: "", full_name: "", iqama_passport: "", position: "", department: "",
  basic_salary: 0, ot_rate: 0, ot_rate_holiday: 0,
  allow_food: 0, allow_accommodation: 0, allow_telephone: 0, allow_carwash: 0,
  deduct_fuel: 0, deduct_car_emi: 0,
  phone: "", email: "", bank_iban: "", status: "active", join_date: "",
};

export function AddEmployee({ nextCode }: { nextCode: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<EmployeeFormValues>({ resolver: zodResolver(employeeSchema) as Resolver<EmployeeFormValues>, defaultValues: { ...EMPTY, employee_code: nextCode } });

  function onSubmit(values: EmployeeFormValues) {
    setErr(null);
    start(async () => {
      const res = await createEmployee(values);
      if (!res.ok) { setErr(res.error ?? "Failed to save"); return; }
      setOpen(false);
      reset({ ...EMPTY, employee_code: nextCode });
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) reset({ ...EMPTY, employee_code: nextCode }); }}>
      <DialogTrigger asChild><Button><Plus /> Add Employee</Button></DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
          <DialogDescription>Create a new employee record.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Employee Code" e={errors.employee_code?.message}><Input {...register("employee_code")} /></F>
            <F label="Full Name" e={errors.full_name?.message}><Input {...register("full_name")} placeholder="e.g. Bilal Khan" /></F>
            <F label="Iqama / Passport"><Input {...register("iqama_passport")} /></F>
            <F label="Position"><Input {...register("position")} placeholder="e.g. Senior Inspector" /></F>
            <F label="Department"><Input {...register("department")} placeholder="e.g. Operations" /></F>
            <F label="Status">
              <Select value={watch("status")} onValueChange={(v) => setValue("status", v as EmployeeFormValues["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </F>
            <F label="Basic Salary (SAR)"><Input type="number" {...register("basic_salary")} /></F>
            <F label="OT Rate — Normal (SAR/hr)"><Input type="number" {...register("ot_rate")} /></F>
            <F label="OT Rate — Holiday (SAR/hr)"><Input type="number" {...register("ot_rate_holiday")} /></F>
            <F label="Phone"><Input {...register("phone")} placeholder="+9665…" /></F>
            <F label="Email" e={errors.email?.message}><Input {...register("email")} type="email" /></F>
            <F label="Bank IBAN"><Input {...register("bank_iban")} placeholder="SA…" /></F>
            <F label="Join Date"><Input type="date" {...register("join_date")} /></F>
          </div>

          <div className="rounded-lg border border-border bg-navy-700 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-steel-dim">Allowances (monthly, SAR)</p>
            <div className="grid gap-3 sm:grid-cols-4">
              <F label="Food"><Input type="number" {...register("allow_food")} /></F>
              <F label="Accommodation (HRA)"><Input type="number" {...register("allow_accommodation")} /></F>
              <F label="Telephone"><Input type="number" {...register("allow_telephone")} /></F>
              <F label="Car Wash"><Input type="number" {...register("allow_carwash")} /></F>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-navy-700 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-steel-dim">Deductions (monthly, SAR)</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <F label="Fuel Bill"><Input type="number" {...register("deduct_fuel")} /></F>
              <F label="Car EMI"><Input type="number" {...register("deduct_car_emi")} /></F>
            </div>
          </div>
          {err && <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{err}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending && <Loader2 className="animate-spin" />} Save Employee</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function F({ label, e, children }: { label: string; e?: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}{e && <p className="text-xs text-danger">{e}</p>}</div>;
}
