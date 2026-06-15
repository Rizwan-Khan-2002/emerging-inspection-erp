"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLE_LABELS, ROLES } from "@/lib/constants";
import { updateUserRole } from "@/lib/actions/admin";
import type { Role } from "@/lib/types";

export function UserRoleSelect({ userId, role, self }: { userId: string; role: Role; self: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Select
      value={role}
      disabled={pending || self}
      onValueChange={(v) =>
        start(async () => {
          const res = await updateUserRole(userId, v as Role);
          if (!res.ok) alert(res.error ?? "Failed");
          router.refresh();
        })
      }
    >
      <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
