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
import { vehicleSchema, type VehicleFormValues } from "@/lib/validations/entities";
import { createVehicle } from "@/lib/actions/entities";

const EMPTY: VehicleFormValues = {
  plate_number: "", make_model: "", insurance_expiry: "", mileage: 0, next_service_date: "", status: "active",
};

export function AddVehicle() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<VehicleFormValues>({ resolver: zodResolver(vehicleSchema) as Resolver<VehicleFormValues>, defaultValues: EMPTY });

  function onSubmit(values: VehicleFormValues) {
    setErr(null);
    start(async () => {
      const res = await createVehicle(values);
      if (!res.ok) { setErr(res.error ?? "Failed to save"); return; }
      setOpen(false); reset(EMPTY); router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) reset(EMPTY); }}>
      <DialogTrigger asChild><Button><Plus /> Add Vehicle</Button></DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Vehicle</DialogTitle>
          <DialogDescription>Register a fleet vehicle.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Plate Number" e={errors.plate_number?.message}><Input {...register("plate_number")} placeholder="e.g. JUB-4471" /></F>
            <F label="Make / Model"><Input {...register("make_model")} placeholder="e.g. Toyota Hilux 2023" /></F>
            <F label="Mileage (km)"><Input type="number" {...register("mileage")} /></F>
            <F label="Status">
              <Select value={watch("status")} onValueChange={(v) => setValue("status", v as VehicleFormValues["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </F>
            <F label="Insurance Expiry"><Input type="date" {...register("insurance_expiry")} /></F>
            <F label="Next Service Date"><Input type="date" {...register("next_service_date")} /></F>
          </div>
          {err && <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{err}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending && <Loader2 className="animate-spin" />} Save Vehicle</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function F({ label, e, children }: { label: string; e?: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}{e && <p className="text-xs text-danger">{e}</p>}</div>;
}
