"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Brand } from "./brand";
import { HeaderSearch } from "./header-search";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";
import { Notifications } from "./notifications";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/constants";
import { t, type Lang } from "@/lib/i18n";
import type { UserProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AppShell({
  user,
  demoMode,
  companyName,
  logoUrl,
  lang = "en",
  children,
}: {
  user: UserProfile;
  demoMode: boolean;
  companyName?: string;
  logoUrl?: string | null;
  lang?: Lang;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const ar = lang === "ar";

  return (
    <div className="app-shell-bg min-h-screen">
      {/* Desktop sidebar */}
      <aside className={cn(
        "fixed inset-y-0 z-30 hidden w-64 flex-col border-border bg-navy/80 backdrop-blur lg:flex",
        ar ? "right-0 border-l" : "left-0 border-r"
      )}>
        <div className="flex h-16 items-center border-b border-border px-5">
          <Brand name={companyName} logoUrl={logoUrl} />
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav role={user.role} lang={lang} />
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
          <aside className={cn(
            "absolute inset-y-0 flex w-72 flex-col border-border bg-navy",
            ar ? "right-0 border-l" : "left-0 border-r"
          )}>
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <Brand name={companyName} logoUrl={logoUrl} />
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1.5 text-steel hover:bg-card-hover"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarNav role={user.role} lang={lang} onNavigate={() => setMobileOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* Background logo watermark */}
      <div className="app-watermark pointer-events-none fixed bottom-[-3rem] right-[-3rem] z-0 hidden select-none lg:block">
        <Image src="/logo.png" alt="" width={560} height={560} className="size-[32rem] object-contain" priority={false} />
      </div>

      {/* Main column */}
      <div className={cn("relative z-10", ar ? "lg:pr-64" : "lg:pl-64")}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-navy/80 px-4 backdrop-blur sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-1.5 text-steel hover:bg-card-hover lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          <HeaderSearch role={user.role} lang={lang} />

          <div className="ms-auto flex items-center gap-1 sm:gap-2">
            {demoMode && (
              <Badge tone="accent" className="hidden sm:inline-flex">
                {t(lang, "Demo")} · {ROLE_LABELS[user.role]}
              </Badge>
            )}
            <LanguageToggle lang={lang} />
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
