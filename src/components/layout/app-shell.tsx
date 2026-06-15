"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, Search, X } from "lucide-react";
import { Brand } from "./brand";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";
import { Notifications } from "./notifications";
import { ThemeToggle } from "./theme-toggle";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/constants";
import type { UserProfile } from "@/lib/types";

export function AppShell({
  user,
  demoMode,
  children,
}: {
  user: UserProfile;
  demoMode: boolean;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell-bg min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-navy/80 backdrop-blur lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav role={user.role} />
        </div>
        <div className="border-t border-border p-3 text-[10px] text-steel-dim">
          Emerging Inspection ERP · v1.0
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-border bg-navy">
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <Brand />
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1.5 text-steel hover:bg-card-hover"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarNav role={user.role} onNavigate={() => setMobileOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* Background logo watermark */}
      <div className="pointer-events-none fixed bottom-[-4rem] right-[-4rem] z-0 hidden select-none opacity-[0.035] lg:block">
        <Image src="/logo.png" alt="" width={520} height={520} className="size-[34rem] object-contain" priority={false} />
      </div>

      {/* Main column */}
      <div className="relative z-10 lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-navy/80 px-4 backdrop-blur sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-1.5 text-steel hover:bg-card-hover lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-steel-dim" />
            <input
              placeholder="Search leads, inspections, employees…"
              className="h-10 w-full rounded-lg border border-border bg-navy-700 pl-9 pr-3 text-sm text-foreground placeholder:text-steel-dim focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {demoMode && (
              <Badge tone="accent" className="hidden sm:inline-flex">
                Demo · {ROLE_LABELS[user.role]}
              </Badge>
            )}
            <ThemeToggle />
            <Notifications />
            <UserMenu user={user} demoMode={demoMode} />
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] animate-fade-in p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
