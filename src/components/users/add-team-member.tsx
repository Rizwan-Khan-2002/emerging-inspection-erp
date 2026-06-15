"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLE_LABELS, ROLES } from "@/lib/constants";
import { teamMemberSchema, type TeamMemberFormValues } from "@/lib/validations/entities";
import { createTeamMember } from "@/lib/actions/admin";

const EMPTY: TeamMemberFormValues = { full_name: "", email: "", password: "", role: "inspector" };

export function AddTeamMember() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<TeamMemberFormValues>({ resolver: zodResolver(teamMemberSchema), defaultValues: EMPTY });

  function onSubmit(v: TeamMemberFormValues) {
    setErr(null);
    start(async () => {
      const res = await createTeamMember(v);
      if (!res.ok) { setErr(res.error ?? "Failed"); return; }
      setDone(`${v.full_name} added as ${ROLE_LABELS[v.role]}. Share email: ${v.email} and the password you set.`);
      reset(EMPTY);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) { reset(EMPTY); setErr(null); setDone(null); } }}>
      <DialogTrigger asChild><Button><UserPlus /> Add Team Member</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>Create an account with a role directly. Share the login with them.</DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-success/30 bg-success/10 p-4">
              <Check className="mt-0.5 size-5 shrink-0 text-success" />
              <p className="text-sm text-foreground">{done}</p>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setDone(null)}>Add another</Button>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Full Name</Label><Input {...register("full_name")} placeholder="e.g. Bilal Khan" />{errors.full_name && <p className="text-xs text-danger">{errors.full_name.message}</p>}</div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={watch("role")} onValueChange={(v) => setValue("role", v as TeamMemberFormValues["role"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Email</Label><Input {...register("email")} type="email" placeholder="name@emerginginspection.com" />{errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}</div>
              <div className="space-y-1.5"><Label>Temporary Password</Label><Input {...register("password")} placeholder="min 6 chars" />{errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}</div>
            </div>
            {err && <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{err}</p>}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={pending}>{pending && <Loader2 className="animate-spin" />} Create Account</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
