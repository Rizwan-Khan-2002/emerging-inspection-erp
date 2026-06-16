"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type {
  ClientFormValues, EmployeeFormValues, ProjectFormValues, VehicleFormValues,
} from "@/lib/validations/entities";
import { notifyOps } from "./notifications";

type Res = { ok: boolean; error?: string };

async function insert(table: string, payload: Record<string, unknown>, revalidate: string): Promise<Res> {
  if (!isSupabaseConfigured) return { ok: true };
  const sb = await createClient();
  if (!sb) return { ok: false, error: "No database connection." };
  const { error } = await sb.from(table).insert(payload);
  if (error) return { ok: false, error: error.message };
  revalidatePath(revalidate);
  return { ok: true };
}

export async function createEmployee(v: EmployeeFormValues): Promise<Res> {
  return insert("employees", { ...v, email: v.email || null, join_date: v.join_date || null }, "/employees");
}

export async function createProject(v: ProjectFormValues): Promise<Res> {
  return insert("projects", {
    name: v.name,
    client_id: v.client_id || null,
    site_location: v.site_location || null,
    status: v.status,
    start_date: v.start_date || null,
    end_date: v.end_date || null,
    budget: v.budget ?? null,
  }, "/projects");
}

export async function createClientRecord(v: ClientFormValues): Promise<Res> {
  return insert("clients", { ...v, email: v.email || null }, "/clients");
}

function seq() {
  return Math.floor(1000 + Math.random() * 9000);
}
const year = () => new Date().getFullYear();

export async function createQuotation(v: import("@/lib/validations/entities").QuotationFormValues): Promise<Res> {
  return insert("quotations", {
    number: `QT-${year()}-${seq()}`,
    client_id: v.client_id,
    amount: v.amount,
    valid_until: v.valid_until || null,
    status: v.status,
  }, "/quotations");
}

export async function createInvoice(v: import("@/lib/validations/entities").InvoiceFormValues): Promise<Res> {
  const vat = Math.round(v.amount * 0.15 * 100) / 100;
  return insert("invoices", {
    number: `INV-${year()}-${seq()}`,
    client_id: v.client_id,
    amount: v.amount,
    vat,
    due_date: v.due_date || null,
    status: v.status,
  }, "/invoices");
}

export async function createPayroll(v: import("@/lib/validations/entities").PayrollFormValues): Promise<Res> {
  return insert("payroll", { ...v }, "/payroll");
}

export async function createFuel(v: import("@/lib/validations/entities").FuelFormValues): Promise<Res> {
  const res = await insert("fuel_expenses", {
    vehicle_id: v.vehicle_id,
    employee_id: v.employee_id || null,
    date: v.date,
    liters: v.liters,
    amount: v.amount,
    approval: "pending",
  }, "/fuel");
  if (res.ok) await notifyOps({ title: "Fuel claim submitted", body: `${v.amount} SAR — awaiting approval`, type: "warning" });
  return res;
}

export async function createOvertime(v: import("@/lib/validations/entities").OvertimeFormValues): Promise<Res> {
  return insert("overtime", {
    employee_id: v.employee_id,
    date: v.date,
    start_time: v.start_time,
    end_time: v.end_time,
    total_hours: v.total_hours,
    standard_hours: 8,
    approval: "pending",
  }, "/overtime");
}

/** Approve / reject an overtime or fuel record. */
export async function setApproval(
  table: "overtime" | "fuel_expenses" | "expense_claims",
  id: string,
  approval: "approved" | "rejected"
): Promise<Res> {
  if (!isSupabaseConfigured) return { ok: true };
  const sb = await createClient();
  if (!sb) return { ok: false, error: "No database connection." };
  const { error } = await sb.from(table).update({ approval }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  const path = table === "overtime" ? "/overtime" : table === "fuel_expenses" ? "/fuel" : "/expenses";
  revalidatePath(path);
  return { ok: true };
}

/** Delete an employee + all their linked records (payroll, attendance, overtime cascade). */
export async function deleteEmployee(id: string): Promise<Res> {
  if (!isSupabaseConfigured) return { ok: true };
  const sb = await createClient();
  if (!sb) return { ok: false, error: "No database connection." };
  // Clean up records that don't cascade, then the employee.
  await sb.from("fuel_expenses").delete().eq("employee_id", id);
  await sb.from("expense_claims").delete().eq("employee_id", id);
  await sb.from("overtime").delete().eq("employee_id", id);
  await sb.from("attendance").delete().eq("employee_id", id);
  await sb.from("payroll").delete().eq("employee_id", id);
  const { error } = await sb.from("employees").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/employees");
  return { ok: true };
}

/** Generic single-record delete for simple tables (clients, vehicles, projects, quotations, invoices). */
export async function deleteRecord(
  table: "clients" | "vehicles" | "projects" | "quotations" | "invoices",
  id: string, revalidate: string
): Promise<Res> {
  if (!isSupabaseConfigured) return { ok: true };
  const sb = await createClient();
  if (!sb) return { ok: false, error: "No database connection." };
  const { error } = await sb.from(table).delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(revalidate);
  return { ok: true };
}

const norm = (k: string) => k.trim().toLowerCase().replace(/[\s-]+/g, "_");
type ImportRes = { ok: boolean; count: number; error?: string };

async function bulkInsert(
  table: string, payload: Record<string, unknown>[], revalidate: string, onConflict?: string
): Promise<ImportRes> {
  if (payload.length === 0) return { ok: false, count: 0, error: "No valid rows found in the file." };
  if (!isSupabaseConfigured) return { ok: true, count: payload.length };
  const sb = await createClient();
  if (!sb) return { ok: false, count: 0, error: "No database connection." };
  const { error } = onConflict
    ? await sb.from(table).upsert(payload, { onConflict })
    : await sb.from(table).insert(payload);
  if (error) return { ok: false, count: 0, error: error.message };
  revalidatePath(revalidate);
  return { ok: true, count: payload.length };
}

export async function importClients(rows: Record<string, unknown>[]): Promise<ImportRes> {
  const payload = rows.map((r) => {
    const o: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(r)) o[norm(k)] = v;
    return {
      company_name: String(o.company_name ?? o.company ?? "").trim(),
      industry: o.industry ? String(o.industry) : null,
      contact_person: o.contact_person ? String(o.contact_person) : null,
      email: o.email ? String(o.email) : null,
      phone: o.phone ? String(o.phone) : null,
      city: o.city ? String(o.city) : null,
      country: o.country ? String(o.country) : "Saudi Arabia",
      vat_number: o.vat_number ? String(o.vat_number) : null,
      payment_terms: o.payment_terms ? String(o.payment_terms) : "Net 30",
    };
  }).filter((c) => c.company_name);
  return bulkInsert("clients", payload, "/clients");
}

export async function importEmployees(rows: Record<string, unknown>[]): Promise<ImportRes> {
  const mapped = rows.map((r) => {
    const o: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(r)) o[norm(k)] = v;
    const statusRaw = norm(String(o.status ?? "active"));
    const status = ["active", "on_leave", "inactive"].includes(statusRaw) ? statusRaw : "active";
    return {
      employee_code: String(o.employee_code ?? o.code ?? "").trim(),
      full_name: String(o.full_name ?? o.name ?? "").trim(),
      iqama_passport: o.iqama_passport ? String(o.iqama_passport) : null,
      position: o.position ? String(o.position) : null,
      department: o.department ? String(o.department) : null,
      basic_salary: o.basic_salary ? Number(o.basic_salary) || 0 : 0,
      ot_rate: o.ot_rate ? Number(o.ot_rate) || 0 : 0,
      phone: o.phone ? String(o.phone) : null,
      email: o.email ? String(o.email) : null,
      status,
    };
  }).filter((e) => e.full_name);

  if (mapped.length === 0) return { ok: false, count: 0, error: "No valid rows found in the file." };
  if (!isSupabaseConfigured) return { ok: true, count: mapped.length };

  const sb = await createClient();
  if (!sb) return { ok: false, count: 0, error: "No database connection." };

  // Auto-assign EMP-### codes for rows missing one, continuing past existing codes.
  const { data: existing } = await sb.from("employees").select("employee_code");
  const used = new Set<string>((existing ?? []).map((e) => String(e.employee_code)));
  let n = Math.max(0, ...[...used].map((c) => { const m = /(\d+)\s*$/.exec(c); return m ? parseInt(m[1], 10) : 0; }));
  for (const e of mapped) {
    if (!e.employee_code) {
      do { n++; e.employee_code = `EMP-${String(n).padStart(3, "0")}`; } while (used.has(e.employee_code));
      used.add(e.employee_code);
    }
  }
  // Collapse duplicate codes within the sheet (last row wins) so upsert is conflict-safe.
  const byCode = new Map<string, (typeof mapped)[number]>();
  for (const e of mapped) byCode.set(e.employee_code, e);

  return bulkInsert("employees", [...byCode.values()], "/employees", "employee_code");
}

export async function createExpense(v: import("@/lib/validations/entities").ExpenseFormValues): Promise<Res> {
  const res = await insert("expense_claims", {
    employee_id: v.employee_id || null,
    category: v.category,
    description: v.description || null,
    amount: v.amount,
    approval: "pending",
  }, "/expenses");
  if (res.ok) await notifyOps({ title: "Expense claim submitted", body: `${v.category} · ${v.amount} SAR`, type: "warning" });
  return res;
}

export async function createVehicle(v: VehicleFormValues): Promise<Res> {
  return insert("vehicles", {
    plate_number: v.plate_number,
    make_model: v.make_model || null,
    insurance_expiry: v.insurance_expiry || null,
    mileage: v.mileage ?? null,
    next_service_date: v.next_service_date || null,
    status: v.status,
  }, "/vehicles");
}
