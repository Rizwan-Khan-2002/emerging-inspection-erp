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
