"use client";

import {
  LayoutDashboard, Target, Building2, FileText, Receipt, ClipboardCheck,
  FileCheck2, MapPin, FolderKanban, Users, CalendarCheck, Clock, Wallet,
  Truck, Fuel, ReceiptText, Files, ShieldCheck, Settings, type LucideIcon,
} from "lucide-react";

/** Map nav icon names (strings in constants) to Lucide components. */
const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard, Target, Building2, FileText, Receipt, ClipboardCheck,
  FileCheck2, MapPin, FolderKanban, Users, CalendarCheck, Clock, Wallet,
  Truck, Fuel, ReceiptText, Files, ShieldCheck, Settings,
};

export function NavIcon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name] ?? LayoutDashboard;
  return <Cmp className={className} />;
}
