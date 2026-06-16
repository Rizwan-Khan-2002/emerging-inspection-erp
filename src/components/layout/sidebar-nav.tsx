"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIcon } from "@/components/common/icon";
import { NAV_GROUP_ORDER, navForRole } from "@/lib/constants";
import { navLabel, groupLabel, type Lang } from "@/lib/i18n";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SidebarNav({ role, lang = "en", onNavigate }: { role: Role; lang?: Lang; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = navForRole(role);

  return (
    <nav className="flex flex-col gap-5 px-3 py-4">
      {NAV_GROUP_ORDER.map((group) => {
        const groupItems = items.filter((i) => i.group === group);
        if (groupItems.length === 0) return null;
        return (
          <div key={group} className="space-y-1">
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-steel-dim">
              {groupLabel(lang, group)}
            </p>
            {groupItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent/15 text-accent"
                      : "text-steel hover:bg-card-hover hover:text-foreground"
                  )}
                >
                  <NavIcon
                    name={item.icon}
                    className={cn("size-[18px] shrink-0", active ? "text-accent" : "text-steel-dim group-hover:text-foreground")}
                  />
                  <span className="truncate">{navLabel(lang, item.href, item.label)}</span>
                  {item.badge && (
                    <span className="ml-auto rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-navy">
                      {item.badge}
                    </span>
                  )}
                  {active && <span className="ml-auto size-1.5 rounded-full bg-accent" />}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
