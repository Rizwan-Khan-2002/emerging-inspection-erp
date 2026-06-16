"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { NavIcon } from "@/components/common/icon";
import { navForRole } from "@/lib/constants";
import { navLabel, t, type Lang } from "@/lib/i18n";
import type { Role } from "@/lib/types";

/** Quick navigation: type a module name and jump to it (Enter / click). */
export function HeaderSearch({ role, lang = "en" }: { role: Role; lang?: Lang }) {
  const router = useRouter();
  const items = useMemo(() => navForRole(role), [role]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items
      .filter((i) =>
        i.label.toLowerCase().includes(q) ||
        i.group.toLowerCase().includes(q) ||
        navLabel(lang, i.href, i.label).toLowerCase().includes(q))
      .slice(0, 6);
  }, [items, query, lang]);

  function go(href: string) {
    setQuery("");
    setOpen(false);
    router.push(href);
  }

  return (
    <div className="relative hidden max-w-md flex-1 md:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-steel-dim" />
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => { blurTimer.current = setTimeout(() => setOpen(false), 120); }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && matches[0]) { e.preventDefault(); go(matches[0].href); }
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder={t(lang, "Search modules — inspections, employees, payroll…")}
        className="h-10 w-full rounded-lg border border-border bg-navy-700 pl-9 pr-3 text-sm text-foreground placeholder:text-steel-dim focus:outline-none focus:ring-2 focus:ring-accent"
      />
      {open && matches.length > 0 && (
        <div
          className="absolute left-0 right-0 top-12 z-40 overflow-hidden rounded-lg border border-border bg-navy shadow-xl"
          onMouseDown={() => { if (blurTimer.current) clearTimeout(blurTimer.current); }}
        >
          {matches.map((m) => (
            <button
              key={m.href}
              type="button"
              onClick={() => go(m.href)}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-steel hover:bg-card-hover hover:text-foreground"
            >
              <NavIcon name={m.icon} className="size-4 shrink-0 text-steel-dim" />
              <span className="flex-1 truncate">{navLabel(lang, m.href, m.label)}</span>
              <span className="text-[10px] uppercase tracking-wider text-steel-dim">{m.group}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
