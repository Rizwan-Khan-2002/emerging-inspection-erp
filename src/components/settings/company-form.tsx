"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { companySchema, type CompanyFormValues } from "@/lib/validations/entities";
import { updateCompanySettings } from "@/lib/actions/company";
import type { CompanySettings } from "@/lib/data";

export function CompanyForm({ initial }: { initial: CompanySettings }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema) as Resolver<CompanyFormValues>,
    defaultValues: {
      company_name: initial.company_name ?? "",
      legal_name: initial.legal_name ?? "",
      address: initial.address ?? "",
      city: initial.city ?? "",
      country: initial.country ?? "Saudi Arabia",
      vat_number: initial.vat_number ?? "",
      phone: initial.phone ?? "",
      email: initial.email ?? "",
      currency: initial.currency ?? "SAR",
      vat_percent: initial.vat_percent ?? 15,
    },
  });

  function onSubmit(values: CompanyFormValues) {
    setErr(null); setSaved(false);
    start(async () => {
      const res = await updateCompanySettings(values);
      if (!res.ok) { setErr(res.error ?? "Failed to save"); return; }
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Building className="size-4 text-accent" /> Company Profile</CardTitle>
        <p className="text-sm text-muted">Edit your company details — these appear on invoices, quotations and payslips.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Company Name" e={errors.company_name?.message}><Input {...register("company_name")} /></F>
            <F label="Legal Name"><Input {...register("legal_name")} /></F>
            <F label="Address" full><Input {...register("address")} /></F>
            <F label="City"><Input {...register("city")} /></F>
            <F label="Country"><Input {...register("country")} /></F>
            <F label="VAT Number"><Input {...register("vat_number")} /></F>
            <F label="Phone"><Input {...register("phone")} /></F>
            <F label="Email" e={errors.email?.message}><Input {...register("email")} type="email" /></F>
            <div className="grid grid-cols-2 gap-4">
              <F label="Currency"><Input {...register("currency")} /></F>
              <F label="VAT %"><Input type="number" {...register("vat_percent")} /></F>
            </div>
          </div>
          {err && <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{err}</p>}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : saved ? <Check /> : null}
              {saved ? "Saved" : "Save Changes"}
            </Button>
            {saved && <span className="text-sm text-success">Company profile updated ✓</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function F({ label, e, full, children }: { label: string; e?: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={`space-y-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <Label>{label}</Label>{children}{e && <p className="text-xs text-danger">{e}</p>}
    </div>
  );
}
