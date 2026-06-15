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
import { projectSchema, type ProjectFormValues } from "@/lib/validations/entities";
import { createProject } from "@/lib/actions/entities";

const EMPTY: ProjectFormValues = {
  name: "", client_id: "", site_location: "", status: "planning", start_date: "", end_date: "", budget: 0,
};

export function AddProject({ clients }: { clients: { id: string; company_name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<ProjectFormValues>({ resolver: zodResolver(projectSchema) as Resolver<ProjectFormValues>, defaultValues: EMPTY });

  function onSubmit(values: ProjectFormValues) {
    setErr(null);
    start(async () => {
      const res = await createProject(values);
      if (!res.ok) { setErr(res.error ?? "Failed to save"); return; }
      setOpen(false); reset(EMPTY); router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) reset(EMPTY); }}>
      <DialogTrigger asChild><Button><Plus /> New Project</Button></DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>Create a project / contract engagement.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <F label="Project Name" e={errors.name?.message}><Input {...register("name")} placeholder="e.g. Sadara Shutdown 2026" /></F>
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Client">
              <Select value={watch("client_id")} onValueChange={(v) => setValue("client_id", v)}>
                <SelectTrigger><SelectValue placeholder={clients.length ? "Select client" : "No clients yet"} /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </F>
            <F label="Status">
              <Select value={watch("status")} onValueChange={(v) => setValue("status", v as ProjectFormValues["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </F>
            <F label="Site Location"><Input {...register("site_location")} placeholder="e.g. Jubail" /></F>
            <F label="Budget (SAR)"><Input type="number" {...register("budget")} /></F>
            <F label="Start Date"><Input type="date" {...register("start_date")} /></F>
            <F label="End Date"><Input type="date" {...register("end_date")} /></F>
          </div>
          {err && <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{err}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending && <Loader2 className="animate-spin" />} Create Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function F({ label, e, children }: { label: string; e?: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}{e && <p className="text-xs text-danger">{e}</p>}</div>;
}
