"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Check, X } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dot } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import {
  fetchMyNotifications, markNotificationRead, markAllNotificationsRead,
  dismissNotification, clearNotifications,
} from "@/lib/actions/notifications";
import type { BadgeTone } from "@/lib/constants";
import type { NotificationItem } from "@/lib/types";

const toneFor: Record<string, BadgeTone> = {
  info: "info", success: "success", warning: "warning", danger: "danger",
};

function ago(iso?: string) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function Notifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const unread = items.filter((n) => !n.read).length;

  const load = useCallback(async () => {
    const data = await fetchMyNotifications();
    setItems(data);
  }, []);

  useEffect(() => {
    load();
    // Poll every 25s as a baseline.
    const interval = setInterval(load, 25000);
    // Live updates via Supabase Realtime (if enabled on the table).
    const supabase = createClient();
    const channel = supabase
      ?.channel("notifications-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => load())
      .subscribe();
    return () => {
      clearInterval(interval);
      if (supabase && channel) supabase.removeChannel(channel);
    };
  }, [load]);

  async function read(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await markNotificationRead(id);
  }
  async function dismiss(id: string) {
    setItems((prev) => prev.filter((n) => n.id !== id));
    await dismissNotification(id);
  }
  async function readAll() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllNotificationsRead();
  }
  async function clearAll() {
    setItems([]);
    await clearNotifications();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative flex size-10 items-center justify-center rounded-lg text-steel hover:bg-card-hover hover:text-foreground focus:outline-none">
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-navy">
            {unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold">Notifications</span>
          {items.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <button onClick={readAll} className="flex items-center gap-1 text-steel hover:text-accent"><Check className="size-3" /> Mark read</button>
              <button onClick={clearAll} className="flex items-center gap-1 text-steel hover:text-danger"><X className="size-3" /> Clear all</button>
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
                <button onClick={() => read(n.id)} className="flex min-w-0 flex-1 items-start gap-3 text-left">
                  <span className="pt-1.5">
                    {n.read ? <span className="block size-1.5 rounded-full ring-1 ring-steel-dim" /> : <Dot tone={toneFor[n.type] ?? "neutral"} />}
                  </span>
                  <span className="min-w-0 space-y-0.5">
                    <span className={`block text-sm leading-tight ${n.read ? "font-normal text-steel-dim" : "font-medium text-foreground"}`}>{n.title}</span>
                    {n.body && <span className="block text-xs text-steel-dim">{n.body}</span>}
                    <span className="text-[10px] text-steel-dim">{ago(n.created_at)}</span>
                  </span>
                </button>
                <button onClick={() => dismiss(n.id)} aria-label="Dismiss"
                  className="shrink-0 self-start rounded p-1 text-steel-dim opacity-0 transition-opacity hover:bg-navy-600 hover:text-danger group-hover:opacity-100">
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
