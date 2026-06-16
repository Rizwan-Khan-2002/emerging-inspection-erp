"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Building, Check, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { companySchema, type CompanyFormValues } from "@/lib/validations/entities";
import { updateCompanySettings, updateCompanyLogo } from "@/lib/actions/company";
import type { CompanySettings } from "@/lib/data";

export function CompanyForm({ initial }: { initial: CompanySettings }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const [logo, setLogo] = useState<string | null>(initial.logo_url ?? null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  async function onLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "logos");
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) { alert(d.error ?? "Upload failed"); return; }
      const sv = await updateCompanyLogo(d.url);
      if (!sv.ok) { alert(sv.error ?? "Could not save logo (is the logo_url column added?)"); return; }
      setLogo(d.url);
      router.refresh();
    } catch {
      alert("Logo upload error.");
    } finally {
      setUploadingLogo(false);
      if (logoRef.current) logoRef.current.value = "";
    }
  }
  const toValues = (s: CompanySettings): CompanyFormValues => ({
    company_name: s.company_name ?? "",
    legal_name: s.legal_name ?? "",
    address: s.address ?? "",
    city: s.city ?? "",
    country: s.country ?? "Saudi Arabia",
    vat_number: s.vat_number ?? "",
    phone: s.phone ?? "",
    email: s.email ?? "",
    currency: s.currency ?? "SAR",
    vat_percent: s.vat_percent ?? 15,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema) as Resolver<CompanyFormValues>,
    defaultValues: toValues(initial),
  });

  // Keep the form in sync with the saved data (after refresh / external change).
  useEffect(() => { reset(toValues(initial)); setLogo(initial.logo_url ?? null); }, [initial]); // eslint-disable-line react-hooks/exhaustive-deps

  function onSubmit(values: CompanyFormValues) {
    setErr(null); setSaved(false);
    start(async () => {
      const res = await updateCompanySettings(values);
      if (!res.ok) { setErr(res.error ?? "Failed to save"); return; }
      reset(values); // baseline becomes the saved values
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
        <div className="mb-5 flex items-center gap-4 rounded-lg border border-border bg-navy-700 p-4">
          <div className="flex size-16 items-center justify-center overflow-hidden rounded-xl bg-white">
            <Image
              src={logo || "/logo.png"}
              alt="Company logo"
              width={64}
              height={64}
              className="size-14 object-contain"
              unoptimized
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Company Logo</p>
            <p className="text-xs text-steel-dim">PNG/JPG, shows on the app & PDF documents.</p>
          </div>
          <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={onLogoFile} />
          <Button type="button" variant="secondary" onClick={() => logoRef.current?.click()} disabled={uploadingLogo}>
            {uploadingLogo ? <Loader2 className="animate-spin" /> : <Upload />} Upload Logo
          </Button>
        </div>

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
