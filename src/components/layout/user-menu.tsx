"use client";

import { useTransition } from "react";
import { ChevronsUpDown, LogOut, RefreshCw, UserCog } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLES, ROLE_LABELS } from "@/lib/constants";
import { signInDemo, signOut } from "@/lib/actions/auth";
import type { UserProfile } from "@/lib/types";
import { initials } from "@/lib/utils";

export function UserMenu({ user, demoMode }: { user: UserProfile; demoMode: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-1 pr-2 text-left hover:bg-card-hover focus:outline-none">
        <Avatar>
          <AvatarFallback>{initials(user.full_name)}</AvatarFallback>
        </Avatar>
        <div className="hidden leading-tight sm:block">
          <p className="text-sm font-medium">{user.full_name}</p>
          <p className="text-xs text-steel-dim">{ROLE_LABELS[user.role]}</p>
        </div>
        <ChevronsUpDown className="hidden size-4 text-steel-dim sm:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{user.full_name}</span>
            <span className="text-xs font-normal normal-case text-steel-dim">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <UserCog /> My Profile
        </DropdownMenuItem>

        {demoMode && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>
              <span className="inline-flex items-center gap-1.5">
                <RefreshCw className="size-3" /> Switch demo role
              </span>
            </DropdownMenuLabel>
            {ROLES.map((r) => (
              <DropdownMenuItem
                key={r}
                disabled={pending || r === user.role}
                onSelect={(e) => {
                  e.preventDefault();
                  startTransition(() => signInDemo(r));
                }}
              >
                <span className={r === user.role ? "text-accent" : ""}>{ROLE_LABELS[r]}</span>
              </DropdownMenuItem>
            ))}
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            startTransition(() => signOut());
          }}
          className="text-danger focus:bg-danger/10"
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
