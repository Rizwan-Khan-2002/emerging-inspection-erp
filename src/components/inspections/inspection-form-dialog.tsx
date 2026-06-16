"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LocateFixed, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INSPECTION_TYPE, JOB_STATUS, PRIORITY } from "@/lib/constants";
import { inspectionSchema, type InspectionFormValues, QM_TYPES, MATERIAL_TYPES } from "@/lib/validations/inspection";

const EMPTY: InspectionFormValues = {
  type: "scaffolding", client_id: "", site_location: "",
  scheduled_at: "", priority: "medium", status: "pending", remarks: "",
};

export function InspectionFormDialog({
  open, onOpenChange, onSave, clients, pending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (values: InspectionFormValues) => void;
  clients: { id: string; company_name: string }[];
  pending?: boolean;
}) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<InspectionFormValues>({ resolver: zodResolver(inspectionSchema) as Resolver<InspectionFormValues>, defaultValues: EMPTY });
  const [locating, setLocating] = useState(false);

  useEffect(() => { if (open) reset(EMPTY); }, [open, reset]);

  function useMyLocation() {
    if (!navigator.geolocation) { alert("Geolocation not supported on this device."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("lat", Number(pos.coords.latitude.toFixed(6)));
        setValue("lng", Number(pos.coords.longitude.toFixed(6)));
        setLocating(false);
      },
      () => { setLocating(false); alert("Could not get location. Allow location access and retry."); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Inspection Job</DialogTitle>
          <DialogDescription>Schedule an inspection and assign field resources.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Inspection Type">
              <Select value={watch("type")} onValueChange={(v) => setValue("type", v as InspectionFormValues["type"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(INSPECTION_TYPE).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Client" error={errors.client_id?.message}>
              <Select value={watch("client_id")} onValueChange={(v) => setValue("client_id", v)}>
                <SelectTrigger><SelectValue placeholder={clients.length ? "Select client" : "Add a client first"} /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Site Location" error={errors.site_location?.message}>
              <Input {...register("site_location")} placeholder="e.g. Unit 7, Jubail" />
            </Field>
            <Field label="Scheduled Date & Time" error={errors.scheduled_at?.message}>
              <Input {...register("scheduled_at")} type="datetime-local" />
            </Field>
            <Field label="Priority">
              <Select value={watch("priority")} onValueChange={(v) => setValue("priority", v as InspectionFormValues["priority"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={watch("status")} onValueChange={(v) => setValue("status", v as InspectionFormValues["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(JOB_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="QM Type (mechanical approval)">
              <Select value={watch("qm_type") || "none"} onValueChange={(v) => setValue("qm_type", v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Select QM" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  {QM_TYPES.map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Material / Component">
              <Select value={watch("material") || "none"} onValueChange={(v) => setValue("material", v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Select material" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  {MATERIAL_TYPES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="rounded-lg border border-border bg-navy-700 p-3">
            <div className="mb-2 flex items-center justify-between">
              <Label>GPS Location <span className="font-normal text-steel-dim">(optional — shows on Field Ops map)</span></Label>
              <Button type="button" variant="secondary" size="sm" onClick={useMyLocation} disabled={locating}>
                {locating ? <Loader2 className="animate-spin" /> : <LocateFixed />} Use my location
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input {...register("lat")} type="number" step="any" placeholder="Latitude (e.g. 27.0174)" />
              <Input {...register("lng")} type="number" step="any" placeholder="Longitude (e.g. 49.6225)" />
            </div>
          </div>

          <Field label="Remarks">
            <Textarea {...register("remarks")} placeholder="Scope, access notes, special instructions…" rows={3} />
          </Field>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>Create Inspection</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
