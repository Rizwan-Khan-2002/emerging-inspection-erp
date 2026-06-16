"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS, ROLES } from "@/lib/constants";
import { updateUserRole } from "@/lib/actions/admin";
import type { Role } from "@/lib/types";

// Roles that grant broad access → require confirmation.
const HIGH_PRIVILEGE: Role[] = ["super_admin", "owner"];

export function UserRoleSelect({ userId, role, self }: { userId: string; role: Role; self: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirmRole, setConfirmRole] = useState<Role | null>(null);

  function apply(newRole: Role) {
    start(async () => {
      const res = await updateUserRole(userId, newRole);
      if (!res.ok) alert(res.error ?? "Failed");
      setConfirmRole(null);
      router.refresh();
    });
  }

  function onChange(v: string) {
    const newRole = v as Role;
    if (newRole === role) return;
    if (HIGH_PRIVILEGE.includes(newRole)) setConfirmRole(newRole); // ask first
    else apply(newRole);
  }

  return (
    <>
      <Select value={role} disabled={pending || self} onValueChange={onChange}>
        <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          {ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}
        </SelectContent>
      </Select>

      <Dialog open={!!confirmRole} onOpenChange={(o) => !o && setConfirmRole(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="size-5 text-warning" /> Grant {confirmRole && ROLE_LABELS[confirmRole]} access?
            </DialogTitle>
            <DialogDescription>
              This gives the user <strong>full access</strong> to the entire portal — every module, all company data,
              and the ability to manage users (including changing roles and removing accounts). Only grant this to people you fully trust.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmRole(null)}>Cancel</Button>
            <Button disabled={pending} onClick={() => confirmRole && apply(confirmRole)}>
              {pending && <Loader2 className="animate-spin" />} Yes, grant full access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
