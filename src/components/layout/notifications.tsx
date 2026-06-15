"use client";

import { useState } from "react";
import { Bell, Check, X } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dot } from "@/components/ui/badge";
import { mockNotifications } from "@/lib/mock-data";
import type { BadgeTone } from "@/lib/constants";
import type { NotificationItem } from "@/lib/types";

const toneFor: Record<string, BadgeTone> = {
  info: "info", success: "success", warning: "warning", danger: "danger",
};

export function Notifications() {
  const [items, setItems] = useState<NotificationItem[]>(mockNotifications);
  const unread = items.filter((n) => !n.read).length;

  function dismiss(id: string) {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }
  function toggleRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
  }
  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }
  function clearAll() {
    setItems([]);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative flex size-10 items-center justify-center rounded-lg text-steel hover:bg-card-hover hover:text-foreground focus:outline-none">
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-navy">
            {unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold">Notifications</span>
          {items.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <button onClick={markAllRead} className="flex items-center gap-1 text-steel hover:text-accent">
                <Check className="size-3" /> Mark read
              </button>
              <button onClick={clearAll} className="flex items-center gap-1 text-steel hover:text-danger">
                <X className="size-3" /> Clear all
              </button>
            </div>
          )}
        </div>
        <div className="h-px bg-border" />
        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-steel-dim">All caught up 🎉</p>
          ) : (
            items.map((n) => (
              <div key={n.id} className="group flex gap-3 border-b border-border px-4 py-3 last:border-0 hover:bg-card-hover">
                <button
                  onClick={(e) => { e.preventDefault(); toggleRead(n.id); }}
                  className="flex min-w-0 flex-1 items-start gap-3 text-left"
                >
                  <span className="pt-1.5">
                    {n.read ? <span className="block size-1.5 rounded-full bg-transparent ring-1 ring-steel-dim" /> : <Dot tone={toneFor[n.type] ?? "neutral"} />}
                  </span>
                  <span className="min-w-0 space-y-0.5">
                    <span className={`block text-sm leading-tight ${n.read ? "font-normal text-steel-dim" : "font-medium text-foreground"}`}>{n.title}</span>
                    {n.body && <span className="block text-xs text-steel-dim">{n.body}</span>}
                    {!n.read && <span className="text-[10px] font-medium uppercase tracking-wide text-accent">Tap to mark read</span>}
                  </span>
                </button>
                <button
                  onClick={() => dismiss(n.id)}
                  aria-label="Dismiss"
                  className="shrink-0 self-start rounded p-1 text-steel-dim opacity-0 transition-opacity hover:bg-navy-600 hover:text-danger group-hover:opacity-100"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
