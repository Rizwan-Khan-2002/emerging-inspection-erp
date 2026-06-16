import Link from "next/link";
import {
  Activity, AlertTriangle, ClipboardCheck, Clock, Droplet, FileCheck2, Fuel,
  MapPin, Target, TrendingUp, Truck, Users, Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Reveal } from "@/components/common/reveal";
import { Tilt } from "@/components/common/tilt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RevenueChart, InspectionTypeChart } from "@/components/dashboard/charts";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardCharts, getDashboardStats, getInspections, getReports } from "@/lib/data";
import { INSPECTION_TYPE, JOB_STATUS, PRIORITY, REPORT_STATUS, ROLE_LABELS } from "@/lib/constants";
import { formatSAR } from "@/lib/format";
import type { DashboardStats, Role } from "@/lib/types";

function statsFor(role: Role, s: DashboardStats) {
  const all = {
    leads: { label: "Total Leads", value: s.totalLeads, icon: <Target />, href: "/leads" },
    clients: { label: "Active Clients", value: s.wonClients, icon: <Users />, href: "/clients" },
    projects: { label: "Active Projects", value: s.activeProjects, icon: <Activity />, href: "/projects" },
    revenue: { label: "Monthly Revenue", value: formatSAR(s.monthlyRevenue, { compact: true }), icon: <TrendingUp />, accent: true, href: "/invoices" },
    payroll: { label: "Payroll Expense", value: formatSAR(s.payrollExpense, { compact: true }), icon: <Wallet />, href: "/payroll" },
    fuel: { label: "Fuel Expense", value: formatSAR(s.fuelExpense), icon: <Droplet />, href: "/fuel" },
    inspectors: { label: "Active Inspectors", value: s.activeInspectors, icon: <Users />, href: "/employees" },
    pending: { label: "Pending Reports", value: s.pendingReports, icon: <FileCheck2 />, href: "/reports" },
    vehicles: { label: "Vehicles In Use", value: s.vehiclesInUse, icon: <Truck />, href: "/vehicles" },
    today: { label: "Inspections", value: s.todayInspections, icon: <ClipboardCheck />, accent: true, href: "/inspections" },
    ot: { label: "OT Hours (Month)", value: s.otHoursMonth, icon: <Clock />, href: "/overtime" },
    fuelClaims: { label: "Fuel Claims Pending", value: s.fuelClaimsPending, icon: <Fuel />, href: "/fuel" },
  };
  const map: Record<Role, (keyof typeof all)[]> = {
    super_admin: ["leads", "clients", "projects", "inspectors", "pending", "vehicles", "today", "fuelClaims"],
    owner: ["revenue", "projects", "leads", "clients", "pending", "inspectors", "vehicles", "fuel"],
    admin: ["leads", "clients", "projects", "pending", "vehicles", "inspectors", "today", "fuelClaims"],
    hr: ["inspectors", "payroll", "ot", "today"],
    coordinator: ["today", "pending", "ot", "fuelClaims", "inspectors", "projects"],
    inspector: ["today", "pending", "fuelClaims"],
    client: ["projects", "pending", "today"],
  };
  return map[role].map((k) => ({ key: k, ...all[k] }));
}

export default async function DashboardPage() {
  const user = (await getCurrentUser())!;
  const [stats, inspections, reports, charts] = await Promise.all([
    getDashboardStats(), getInspections(), getReports(), getDashboardCharts(),
  ]);
  const cards = statsFor(user.role, stats);
  const showCharts = ["super_admin", "owner", "admin", "coordinator"].includes(user.role);

  const upcoming = inspections.slice(0, 5);
  const pendingReports = reports.filter((r) =>
    ["pending_review", "submitted", "needs_correction"].includes(r.status)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user.full_name.split(" ")[0]}`}
        description={`${ROLE_LABELS[user.role]} workspace`}
      >
        <Badge tone="success"><span className="size-1.5 rounded-full bg-success" /> All systems operational</Badge>
      </PageHeader>

      <Reveal className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Tilt key={c.key}>
            <StatCard
              label={c.label}
              value={c.value}
              icon={c.icon}
              accent={"accent" in c ? (c.accent as boolean) : undefined}
              href={"href" in c ? (c.href as string) : undefined}
            />
          </Tilt>
        ))}
      </Reveal>

      {showCharts && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="size-4 text-accent" /> Revenue vs Expense <span className="text-xs font-normal text-steel-dim">· last 6 months</span></CardTitle>
            </CardHeader>
            <CardContent>
              {charts.revenueSeries.some((m) => m.revenue || m.expense)
                ? <RevenueChart data={charts.revenueSeries} />
                : <p className="py-16 text-center text-sm text-steel-dim">No invoice or expense data yet.</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ClipboardCheck className="size-4 text-info" /> Inspections by Type</CardTitle>
            </CardHeader>
            <CardContent>
              {charts.inspectionsByType.length
                ? <InspectionTypeChart data={charts.inspectionsByType} />
                : <p className="py-16 text-center text-sm text-steel-dim">No inspections yet.</p>}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><ClipboardCheck className="size-4 text-accent" /> Recent Inspections</CardTitle>
            <Button asChild variant="ghost" size="sm"><Link href="/inspections">View all</Link></Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcoming.map((i) => (
              <Link key={i.id} href={`/inspections/${i.id}`}
                className="flex items-center justify-between rounded-lg border border-border bg-navy-700 p-3 transition-colors hover:border-accent/40">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{INSPECTION_TYPE[i.type]}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-steel-dim"><MapPin className="size-3" /> {i.client_name} · {i.site_location}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone={PRIORITY[i.priority].tone}>{PRIORITY[i.priority].label}</Badge>
                  <StatusBadge status={JOB_STATUS[i.status]} />
                </div>
              </Link>
            ))}
            {upcoming.length === 0 && <p className="py-8 text-center text-sm text-steel-dim">No inspections yet. Create one from the Inspections page.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="size-4 text-warning" /> Reports Needing Action</CardTitle>
            <Button asChild variant="ghost" size="sm"><Link href="/reports">View all</Link></Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingReports.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-border bg-navy-700 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.inspection_ref}</p>
                  <p className="truncate text-xs text-steel-dim">{r.client_name} · {INSPECTION_TYPE[r.type]}</p>
                </div>
                <StatusBadge status={REPORT_STATUS[r.status]} />
              </div>
            ))}
            {pendingReports.length === 0 && <p className="py-8 text-center text-sm text-steel-dim">No reports pending review.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
