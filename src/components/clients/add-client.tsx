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
import { clientSchema, type ClientFormValues } from "@/lib/validations/entities";
import { createClientRecord } from "@/lib/actions/entities";

const EMPTY: ClientFormValues = {
  company_name: "", industry: "", contact_person: "", email: "", phone: "",
  city: "", country: "Saudi Arabia", vat_number: "", payment_terms: "Net 30",
};

export function AddClient() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<ClientFormValues>({ resolver: zodResolver(clientSchema) as Resolver<ClientFormValues>, defaultValues: EMPTY });

  function onSubmit(values: ClientFormValues) {
    setErr(null);
    start(async () => {
      const res = await createClientRecord(values);
      if (!res.ok) { setErr(res.error ?? "Failed to save"); return; }
      setOpen(false); reset(EMPTY); router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) reset(EMPTY); }}>
      <DialogTrigger asChild><Button><Plus /> New Client</Button></DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>New Client</DialogTitle>
          <DialogDescription>Add a client account.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Company Name" e={errors.company_name?.message}><Input {...register("company_name")} /></F>
            <F label="Industry"><Input {...register("industry")} /></F>
            <F label="Contact Person"><Input {...register("contact_person")} /></F>
            <F label="Email" e={errors.email?.message}><Input {...register("email")} type="email" /></F>
            <F label="Phone"><Input {...register("phone")} placeholder="+9665…" /></F>
            <F label="City"><Input {...register("city")} /></F>
            <F label="Country"><Input {...register("country")} /></F>
            <F label="VAT Number"><Input {...register("vat_number")} /></F>
            <F label="Payment Terms"><Input {...register("payment_terms")} placeholder="Net 30" /></F>
          </div>
          {err && <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{err}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending && <Loader2 className="animate-spin" />} Save Client</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function F({ label, e, children }: { label: string; e?: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}{e && <p className="text-xs text-danger">{e}</p>}</div>;
}
