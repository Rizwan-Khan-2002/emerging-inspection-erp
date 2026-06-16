import "server-only";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import * as mock from "@/lib/mock-data";
import { DEMO_USERS } from "@/lib/auth";
import { INSPECTION_TYPE } from "@/lib/constants";
import type {
  AttendanceRecord, Client, DashboardStats, Employee, FuelExpense, Inspection,
  InspectionReport, Invoice, Lead, OvertimeRecord, PayrollRecord, Project,
  Quotation, UserProfile, Vehicle,
} from "@/lib/types";

/**
 * Data access layer.
 * - Supabase configured  → returns REAL data only (empty array when no rows).
 *   No mock data leaks into a live/production database.
 * - Demo mode (no Supabase) → returns mock data so the UI is explorable.
 */

async function read<T>(
  query: (sb: NonNullable<Awaited<ReturnType<typeof createClient>>>) => PromiseLike<{ data: unknown; error: unknown }>,
  fallback: T[]
): Promise<T[]> {
  if (!isSupabaseConfigured) return fallback;
  const sb = await createClient();
  if (!sb) return [];
  const { data, error } = await query(sb);
  if (error || !data) return [];
  return data as T[];
}

export interface ExpenseClaim {
  id: string;
  employee_id?: string;
  employee_name?: string;
  category?: string;
  description?: string;
  amount: number;
  approval: "pending" | "approved" | "rejected";
  created_at?: string;
}

export async function getExpenses(): Promise<ExpenseClaim[]> {
  if (!isSupabaseConfigured) return [];
  const sb = await createClient();
  if (!sb) return [];
  const { data, error } = await sb.from("expense_claims").select("*, employees(full_name)").order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((e) => ({ ...e, employee_name: (e.employees as { full_name?: string } | null)?.full_name ?? "—" })) as ExpenseClaim[];
}

export interface DocumentRow {
  id: string;
  name: string;
  file_url: string;
  expiry_date?: string | null;
  created_at?: string;
}

export async function getDocuments(): Promise<DocumentRow[]> {
  if (!isSupabaseConfigured) return [];
  const sb = await createClient();
  if (!sb) return [];
  const { data } = await sb.from("documents").select("*").order("created_at", { ascending: false });
  return (data ?? []) as DocumentRow[];
}

export async function getProfiles(): Promise<UserProfile[]> {
  if (!isSupabaseConfigured) return Object.values(DEMO_USERS);
  const sb = await createClient();
  if (!sb) return [];
  const { data, error } = await sb.from("profiles").select("*").order("created_at", { ascending: true });
  if (error || !data) return [];
  return data as UserProfile[];
}

export async function getLeads() {
  return read<Lead>((sb) => sb.from("leads").select("*").order("created_at", { ascending: false }), mock.mockLeads);
}
export async function getClients() {
  return read<Client>((sb) => sb.from("clients").select("*").order("created_at", { ascending: false }), mock.mockClients);
}
export async function getEmployees() {
  return read<Employee>((sb) => sb.from("employees").select("*").order("employee_code"), mock.mockEmployees);
}
export async function getVehicles() {
  return read<Vehicle>((sb) => sb.from("vehicles").select("*").order("plate_number"), mock.mockVehicles);
}
export async function getInspections() {
  return read<Inspection>(
    (sb) => sb.from("inspections").select("*, clients(company_name)").order("scheduled_at", { ascending: false }),
    mock.mockInspections
  ).then((rows) => rows.map((r) => ({ ...r, client_name: (r as Inspection & { clients?: { company_name?: string } }).clients?.company_name ?? r.client_name ?? "—" })));
}
export async function getInspectionById(id: string): Promise<Inspection | null> {
  if (!isSupabaseConfigured) return mock.mockInspections.find((i) => i.id === id) ?? null;
  const sb = await createClient();
  if (!sb) return null;
  const { data, error } = await sb.from("inspections").select("*, clients(company_name)").eq("id", id).single();
  if (error || !data) return null;
  return { ...data, client_name: (data.clients as { company_name?: string } | null)?.company_name ?? "—" } as Inspection;
}

export async function getQuotationById(id: string): Promise<Quotation | null> {
  if (!isSupabaseConfigured) return mock.mockQuotations.find((q) => q.id === id || q.number === id) ?? null;
  const sb = await createClient();
  if (!sb) return null;
  const { data } = await sb.from("quotations").select("*, clients(company_name)").or(`id.eq.${id},number.eq.${id}`).single();
  if (!data) return null;
  return { ...data, client_name: (data.clients as { company_name?: string } | null)?.company_name ?? "—" } as Quotation;
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  if (!isSupabaseConfigured) return mock.mockInvoices.find((i) => i.id === id || i.number === id) ?? null;
  const sb = await createClient();
  if (!sb) return null;
  const { data } = await sb.from("invoices").select("*, clients(company_name)").or(`id.eq.${id},number.eq.${id}`).single();
  if (!data) return null;
  return { ...data, client_name: (data.clients as { company_name?: string } | null)?.company_name ?? "—" } as Invoice;
}

export async function getPayrollById(id: string): Promise<PayrollRecord | null> {
  if (!isSupabaseConfigured) return mock.mockPayroll.find((p) => p.id === id) ?? null;
  const sb = await createClient();
  if (!sb) return null;
  const { data } = await sb.from("payroll").select("*, employees(full_name)").eq("id", id).single();
  if (!data) return null;
  return { ...data, employee_name: (data.employees as { full_name?: string } | null)?.full_name ?? "—" } as PayrollRecord;
}

export async function getReports() {
  if (!isSupabaseConfigured) return mock.mockReports;
  const sb = await createClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from("reports")
    .select("*, inspections(ref, type, clients(company_name))")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r) => {
    const insp = r.inspections as { ref?: string; type?: string; clients?: { company_name?: string } } | null;
    return {
      ...r,
      inspection_ref: insp?.ref ?? "—",
      type: (insp?.type ?? "qaqc") as InspectionReport["type"],
      client_name: insp?.clients?.company_name ?? "—",
      inspector_name: r.inspector_name ?? "—",
    };
  }) as InspectionReport[];
}
type Named = { company_name?: string } | null;
type EmpNamed = { full_name?: string } | null;
type VehNamed = { plate_number?: string } | null;

export async function getQuotations() {
  const rows = await read<Quotation & { clients?: Named }>(
    (sb) => sb.from("quotations").select("*, clients(company_name)").order("created_at", { ascending: false }),
    mock.mockQuotations
  );
  return rows.map((q) => ({ ...q, client_name: q.clients?.company_name ?? q.client_name ?? "—" }));
}
export async function getInvoices() {
  const rows = await read<Invoice & { clients?: Named }>(
    (sb) => sb.from("invoices").select("*, clients(company_name)").order("created_at", { ascending: false }),
    mock.mockInvoices
  );
  return rows.map((i) => ({ ...i, client_name: i.clients?.company_name ?? i.client_name ?? "—" }));
}
export async function getPayroll() {
  const rows = await read<PayrollRecord & { employees?: EmpNamed }>(
    (sb) => sb.from("payroll").select("*, employees(full_name)").order("period", { ascending: false }),
    mock.mockPayroll
  );
  return rows.map((p) => ({ ...p, employee_name: p.employees?.full_name ?? p.employee_name ?? "—" }));
}
export async function getOvertime() {
  const rows = await read<OvertimeRecord & { employees?: EmpNamed }>(
    (sb) => sb.from("overtime").select("*, employees(full_name)").order("date", { ascending: false }),
    mock.mockOvertime
  );
  return rows.map((o) => ({ ...o, employee_name: o.employees?.full_name ?? o.employee_name ?? "—" }));
}
export async function getAttendance() {
  const rows = await read<AttendanceRecord & { employees?: EmpNamed }>(
    (sb) => sb.from("attendance").select("*, employees(full_name)").order("date", { ascending: false }),
    mock.mockAttendance
  );
  return rows.map((a) => ({ ...a, employee_name: a.employees?.full_name ?? a.employee_name ?? "—" }));
}
export async function getFuel() {
  const rows = await read<FuelExpense & { vehicles?: VehNamed; employees?: EmpNamed }>(
    (sb) => sb.from("fuel_expenses").select("*, vehicles(plate_number), employees(full_name)").order("date", { ascending: false }),
    mock.mockFuel
  );
  return rows.map((f) => ({
    ...f,
    vehicle_plate: f.vehicles?.plate_number ?? f.vehicle_plate ?? "—",
    employee_name: f.employees?.full_name ?? f.employee_name ?? "—",
  }));
}

export async function getProjects(): Promise<Project[]> {
  if (!isSupabaseConfigured) return mock.mockProjects;
  const sb = await createClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from("projects")
    .select("*, clients(company_name)")
    .order("start_date", { ascending: false });
  if (error || !data) return [];
  return data.map((p) => ({
    ...p,
    client_name: (p.clients as { company_name?: string } | null)?.company_name ?? "—",
  })) as Project[];
}

/* ----------------------------- Company settings -------------------------- */

export interface CompanySettings {
  company_name: string;
  legal_name?: string;
  address?: string;
  city?: string;
  country?: string;
  vat_number?: string;
  phone?: string;
  email?: string;
  currency?: string;
  vat_percent?: number;
  logo_url?: string | null;
}

const DEFAULT_COMPANY: CompanySettings = {
  company_name: "Emerging Inspection Co.",
  country: "Saudi Arabia",
  currency: "SAR",
  vat_percent: 15,
};

export async function getCompanySettings(): Promise<CompanySettings> {
  if (isSupabaseConfigured) {
    const sb = await createClient();
    if (sb) {
      const { data } = await sb.from("company_settings").select("*").eq("id", 1).single();
      if (data) return data as CompanySettings;
    }
  }
  return DEFAULT_COMPANY;
}

/* ------------------------------- Dashboard ------------------------------- */

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!isSupabaseConfigured) return mock.mockStats;
  const sb = await createClient();
  if (!sb) return zeroStats();

  async function cnt(table: string, col?: string, val?: string): Promise<number> {
    const base = sb!.from(table).select("*", { count: "exact", head: true });
    const { count } = col ? await base.eq(col, val!) : await base;
    return count ?? 0;
  }

  const sum = async (table: string, col: string): Promise<number> => {
    const { data } = await sb!.from(table).select(col);
    const rows = (data ?? []) as unknown as Record<string, unknown>[];
    return rows.reduce((s, r) => s + (Number(r[col]) || 0), 0);
  };

  const [leads, clients, projects, inspectors, pendingReports, vehicles, inspections, fuelPending,
    monthlyRevenue, payrollExpense, fuelExpense, otHours] =
    await Promise.all([
      cnt("leads"),
      cnt("clients"),
      cnt("projects", "status", "active"),
      cnt("employees", "status", "active"),
      cnt("reports", "status", "pending_review"),
      cnt("vehicles", "status", "active"),
      cnt("inspections"),
      cnt("fuel_expenses", "approval", "pending"),
      sum("invoices", "total"),
      sum("payroll", "net_salary"),
      sum("fuel_expenses", "amount"),
      sum("overtime", "ot_hours"),
    ]);

  return {
    totalLeads: leads,
    wonClients: clients,
    activeProjects: projects,
    monthlyRevenue,
    payrollExpense,
    fuelExpense,
    activeInspectors: inspectors,
    pendingReports,
    vehiclesInUse: vehicles,
    todayInspections: inspections,
    otHoursMonth: Math.round(otHours * 10) / 10,
    fuelClaimsPending: fuelPending,
  };
}

/* --------------------------- Dashboard charts ---------------------------- */

export interface DashboardCharts {
  revenueSeries: { month: string; revenue: number; expense: number }[];
  inspectionsByType: { type: string; count: number }[];
}

export async function getDashboardCharts(): Promise<DashboardCharts> {
  if (!isSupabaseConfigured) {
    return { revenueSeries: mock.revenueSeries, inspectionsByType: mock.inspectionsByType };
  }
  const sb = await createClient();
  if (!sb) return { revenueSeries: [], inspectionsByType: [] };

  // Build the last 6 month buckets (oldest → newest).
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, n) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - n), 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      month: d.toLocaleString("en-US", { month: "short" }),
      revenue: 0,
      expense: 0,
    };
  });
  const bucket = (dateStr?: string | null) =>
    dateStr ? months.findIndex((m) => m.key === String(dateStr).slice(0, 7)) : -1;

  const [invoices, fuel, payroll, expenses, inspections] = await Promise.all([
    sb.from("invoices").select("total,created_at"),
    sb.from("fuel_expenses").select("amount,date"),
    sb.from("payroll").select("net_salary,period"),
    sb.from("expense_claims").select("amount,created_at"),
    sb.from("inspections").select("type"),
  ]);

  (invoices.data ?? []).forEach((r) => { const i = bucket(r.created_at); if (i >= 0) months[i].revenue += Number(r.total) || 0; });
  (fuel.data ?? []).forEach((r) => { const i = bucket(r.date); if (i >= 0) months[i].expense += Number(r.amount) || 0; });
  (expenses.data ?? []).forEach((r) => { const i = bucket(r.created_at); if (i >= 0) months[i].expense += Number(r.amount) || 0; });
  (payroll.data ?? []).forEach((r) => { const i = months.findIndex((m) => m.key === r.period); if (i >= 0) months[i].expense += Number(r.net_salary) || 0; });

  const counts: Record<string, number> = {};
  (inspections.data ?? []).forEach((r) => { counts[r.type] = (counts[r.type] ?? 0) + 1; });
  const inspectionsByType = Object.entries(counts).map(([k, count]) => ({
    type: INSPECTION_TYPE[k as keyof typeof INSPECTION_TYPE] ?? k,
    count,
  }));

  return {
    revenueSeries: months.map(({ month, revenue, expense }) => ({ month, revenue, expense })),
    inspectionsByType,
  };
}

function zeroStats(): DashboardStats {
  return {
    totalLeads: 0, wonClients: 0, activeProjects: 0, monthlyRevenue: 0,
    payrollExpense: 0, fuelExpense: 0, activeInspectors: 0, pendingReports: 0,
    vehiclesInUse: 0, todayInspections: 0, otHoursMonth: 0, fuelClaimsPending: 0,
  };
}
