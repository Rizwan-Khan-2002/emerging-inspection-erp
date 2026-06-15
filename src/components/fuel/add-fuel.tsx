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
import { fuelSchema, type FuelFormValues } from "@/lib/validations/entities";
import { createFuel } from "@/lib/actions/entities";

const EMPTY: FuelFormValues = { vehicle_id: "", employee_id: "", date: "", liters: 0, amount: 0 };

export function AddFuel({
  vehicles, employees,
}: {
  vehicles: { id: string; plate_number: string }[];
  employees: { id: string; full_name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<FuelFormValues>({ resolver: zodResolver(fuelSchema) as Resolver<FuelFormValues>, defaultValues: EMPTY });

  function onSubmit(v: FuelFormValues) {
    setErr(null);
    start(async () => {
      const res = await createFuel(v);
      if (!res.ok) { setErr(res.error ?? "Failed"); return; }
      setOpen(false); reset(EMPTY); router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) reset(EMPTY); }}>
      <DialogTrigger asChild><Button><Plus /> Submit Claim</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Submit Fuel Claim</DialogTitle><DialogDescription>Logs a fuel expense for approval.</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Vehicle</Label>
              <Select value={watch("vehicle_id")} onValueChange={(v) => setValue("vehicle_id", v)}>
                <SelectTrigger><SelectValue placeholder={vehicles.length ? "Select" : "Add vehicles first"} /></SelectTrigger>
                <SelectContent>{vehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.plate_number}</SelectItem>)}</SelectContent>
              </Select>
              {errors.vehicle_id && <p className="text-xs text-danger">{errors.vehicle_id.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Employee</Label>
              <Select value={watch("employee_id")} onValueChange={(v) => setValue("employee_id", v)}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Date</Label><Input type="date" {...register("date")} /></div>
            <div className="space-y-1.5"><Label>Litres</Label><Input type="number" {...register("liters")} /></div>
            <div className="space-y-1.5"><Label>Amount (SAR)</Label><Input type="number" {...register("amount")} /></div>
          </div>
          {err && <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{err}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending && <Loader2 className="animate-spin" />} Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
