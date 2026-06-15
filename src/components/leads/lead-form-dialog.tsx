"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LEAD_SOURCE_LABELS, LEAD_STATUS } from "@/lib/constants";
import { leadSchema, type LeadFormValues } from "@/lib/validations/lead";
import type { Lead } from "@/lib/types";

const EMPTY: LeadFormValues = {
  company_name: "", industry: "", contact_person: "", position: "", email: "",
  phone: "", whatsapp: "", country: "Saudi Arabia", city: "", source: "website",
  status: "new", estimated_value: 0, follow_up_date: "", notes: "",
};

export function LeadFormDialog({
  open, onOpenChange, initial, onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Lead | null;
  onSave: (values: LeadFormValues) => void;
}) {
  const {
    register, handleSubmit, reset, setValue, watch, formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema) as Resolver<LeadFormValues>,
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) {
      reset(initial ? { ...EMPTY, ...initial, follow_up_date: initial.follow_up_date ?? "" } : EMPTY);
    }
  }, [open, initial, reset]);

  const source = watch("source");
  const status = watch("status");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Lead" : "New Lead"}</DialogTitle>
          <DialogDescription>
            {initial ? "Update lead details and pipeline status." : "Capture a new sales lead into the CRM pipeline."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company Name" error={errors.company_name?.message}>
              <Input {...register("company_name")} placeholder="e.g. SABIC Jubail" />
            </Field>
            <Field label="Industry" error={errors.industry?.message}>
              <Input {...register("industry")} placeholder="e.g. Petrochemical" />
            </Field>
            <Field label="Contact Person" error={errors.contact_person?.message}>
              <Input {...register("contact_person")} placeholder="Full name" />
            </Field>
            <Field label="Position">
              <Input {...register("position")} placeholder="e.g. Procurement Manager" />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <Input {...register("email")} type="email" placeholder="name@company.com" />
            </Field>
            <Field label="Phone">
              <Input {...register("phone")} placeholder="+9665…" />
            </Field>
            <Field label="WhatsApp">
              <Input {...register("whatsapp")} placeholder="+9665…" />
            </Field>
            <Field label="Estimated Value (SAR)">
              <Input {...register("estimated_value")} type="number" min={0} placeholder="0" />
            </Field>
            <Field label="Country" error={errors.country?.message}>
              <Input {...register("country")} />
            </Field>
            <Field label="City">
              <Input {...register("city")} placeholder="e.g. Jubail" />
            </Field>

            <Field label="Lead Source">
              <Select value={source} onValueChange={(v) => setValue("source", v as LeadFormValues["source"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(LEAD_SOURCE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={status} onValueChange={(v) => setValue("status", v as LeadFormValues["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(LEAD_STATUS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Follow-up Date">
              <Input {...register("follow_up_date")} type="date" />
            </Field>
          </div>

          <Field label="Notes">
            <Textarea {...register("notes")} placeholder="Context, requirements, next steps…" rows={3} />
          </Field>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{initial ? "Save Changes" : "Create Lead"}</Button>
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
