// Seed demo/sample data via the Supabase service-role REST API.
// Re-run safe: rows are matched on natural keys and upserted, not duplicated.
//   node scripts/seed-sample.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = Object.fromEntries(
  readFileSync(join(root, ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) { console.error("Missing Supabase URL / service-role key in .env.local"); process.exit(1); }

const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

async function rest(method, path, body, prefer) {
  const r = await fetch(`${URL}/rest/v1/${path}`, {
    method,
    headers: prefer ? { ...H, Prefer: prefer } : H,
    body: body ? JSON.stringify(body) : undefined,
  });
  const txt = await r.text();
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status} ${txt}`);
  return txt ? JSON.parse(txt) : null;
}

// Insert rows, returning the representation; on_conflict makes it idempotent.
const upsert = (table, rows, onConflict) =>
  rest("POST", `${table}${onConflict ? `?on_conflict=${onConflict}` : ""}`, rows,
    "resolution=merge-duplicates,return=representation");

// Find-or-create for tables without a natural unique key (clients).
async function findOrCreate(table, matchCol, matchVal, row) {
  const found = await rest("GET", `${table}?${matchCol}=eq.${encodeURIComponent(matchVal)}&select=id`);
  if (found?.length) return found[0].id;
  const created = await rest("POST", table, row, "return=representation");
  return created[0].id;
}

// Insert rows only if the table has no data yet (for tables without a unique key).
async function seedIfEmpty(table, rows) {
  const existing = await rest("GET", `${table}?select=id&limit=1`);
  if (existing?.length) { console.log(`  • ${table} already has data — skipped`); return; }
  await rest("POST", table, rows, "return=minimal");
}

const today = new Date();
const iso = (d) => d.toISOString();
const period = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

async function main() {
  console.log("→ Seeding sample data…");

  // ---- Clients -------------------------------------------------------
  const aramcoId = await findOrCreate("clients", "company_name", "Saudi Aramco", {
    company_name: "Saudi Aramco", industry: "Oil & Gas", contact_person: "Khalid Al-Otaibi",
    email: "procurement@aramco.com", phone: "+966 13 872 0000", city: "Dhahran",
    country: "Saudi Arabia", vat_number: "300000000000003", payment_terms: "Net 60",
    outstanding_balance: 185000, active: true,
  });
  const sabicId = await findOrCreate("clients", "company_name", "SABIC", {
    company_name: "SABIC", industry: "Petrochemicals", contact_person: "Mona Al-Harbi",
    email: "vendors@sabic.com", phone: "+966 11 225 8000", city: "Riyadh",
    country: "Saudi Arabia", vat_number: "300000000000011", payment_terms: "Net 30",
    outstanding_balance: 42000, active: true,
  });
  console.log("  ✓ clients");

  // ---- Employees (2 OT rates + allowances + deductions) --------------
  const employees = await upsert("employees", [
    {
      employee_code: "EMP-101", full_name: "Mohammed Iqbal", iqama_passport: "2412345678",
      position: "Senior Inspector", department: "Mechanical", basic_salary: 6500,
      ot_rate: 35, ot_rate_holiday: 55,
      allow_food: 400, allow_accommodation: 800, allow_telephone: 100, allow_carwash: 60,
      deduct_fuel: 150, deduct_car_emi: 500,
      phone: "+966 50 111 2233", email: "m.iqbal@example.com", status: "active", join_date: "2023-02-15",
    },
    {
      employee_code: "EMP-102", full_name: "Abdul Rahman Sheikh", iqama_passport: "2487654321",
      position: "NDT Technician (Level II)", department: "NDT", basic_salary: 5200,
      ot_rate: 30, ot_rate_holiday: 48,
      allow_food: 400, allow_accommodation: 700, allow_telephone: 80, allow_carwash: 60,
      deduct_fuel: 120, deduct_car_emi: 0,
      phone: "+966 55 222 3344", email: "a.sheikh@example.com", status: "active", join_date: "2023-06-01",
    },
    {
      employee_code: "EMP-103", full_name: "Suresh Kumar", iqama_passport: "2455667788",
      position: "QA/QC Coordinator", department: "QA/QC", basic_salary: 7000,
      ot_rate: 38, ot_rate_holiday: 60,
      allow_food: 450, allow_accommodation: 900, allow_telephone: 120, allow_carwash: 60,
      deduct_fuel: 0, deduct_car_emi: 650,
      phone: "+966 56 333 4455", email: "s.kumar@example.com", status: "on_leave", join_date: "2022-11-10",
    },
  ], "employee_code");
  const empByCode = Object.fromEntries(employees.map((e) => [e.employee_code, e.id]));
  console.log("  ✓ employees");

  // ---- Vehicle -------------------------------------------------------
  const vehicles = await upsert("vehicles", [{
    plate_number: "RUH-4827", make_model: "Toyota Hilux 2022",
    assigned_employee: empByCode["EMP-101"], insurance_expiry: "2026-09-30",
    mileage: 84210, next_service_date: "2026-07-05", status: "active",
  }], "plate_number");
  const vehId = vehicles[0].id;
  console.log("  ✓ vehicles");

  // ---- Inspections (Aramco + QM, and Non-Aramco + material) ----------
  await upsert("inspections", [
    {
      ref: "INS-2026-0101", type: "mechanical", client_id: aramcoId, site_location: "Abqaiq Plant – Unit 042",
      scheduled_at: iso(today), priority: "high", status: "in_progress",
      approval_type: "aramco", qm_type: "QM-5", material: null,
      remarks: "Aramco QM-5 mechanical approval — pressure vessel weld verification.",
    },
    {
      ref: "INS-2026-0102", type: "qaqc", client_id: sabicId, site_location: "Jubail – Fabrication Yard 3",
      scheduled_at: iso(new Date(today.getTime() + 86400000)), priority: "medium", status: "assigned",
      approval_type: "non_aramco", qm_type: null, material: "Fastener",
      remarks: "Non-Aramco third-party QA/QC — fastener material certification & hardness check.",
    },
    {
      ref: "INS-2026-0103", type: "ndt", client_id: aramcoId, site_location: "Ras Tanura – Tank Farm",
      scheduled_at: iso(new Date(today.getTime() + 2 * 86400000)), priority: "critical", status: "pending",
      approval_type: "aramco", qm_type: "QM-7", material: null,
      remarks: "Aramco QM-7 NDT — UT thickness survey on storage tank shell.",
    },
  ], "ref");
  console.log("  ✓ inspections");

  // ---- Payroll for the current period --------------------------------
  await upsert("payroll", [
    {
      employee_id: empByCode["EMP-101"], period, basic_salary: 6500, ot_amount: 1400,
      allowances: 400 + 800 + 100 + 60, deductions: 150 + 500, status: "approved",
    },
    {
      employee_id: empByCode["EMP-102"], period, basic_salary: 5200, ot_amount: 900,
      allowances: 400 + 700 + 80 + 60, deductions: 120, status: "draft",
    },
    {
      employee_id: empByCode["EMP-103"], period, basic_salary: 7000, ot_amount: 0,
      allowances: 450 + 900 + 120 + 60, deductions: 650, status: "draft",
    },
  ], "employee_id,period");
  console.log("  ✓ payroll");

  // ---- Attendance (last 3 days) --------------------------------------
  await upsert("attendance", [
    { employee_id: empByCode["EMP-101"], date: "2026-06-15", status: "present", check_in: "07:00", check_out: "17:00", total_hours: 10, late_minutes: 0 },
    { employee_id: empByCode["EMP-101"], date: "2026-06-14", status: "night_shift", check_in: "19:00", check_out: "05:00", total_hours: 10, late_minutes: 0 },
    { employee_id: empByCode["EMP-101"], date: "2026-06-13", status: "present", check_in: "07:08", check_out: "16:00", total_hours: 8.9, late_minutes: 8 },
    { employee_id: empByCode["EMP-102"], date: "2026-06-15", status: "present", check_in: "07:00", check_out: "16:00", total_hours: 9, late_minutes: 0 },
    { employee_id: empByCode["EMP-102"], date: "2026-06-14", status: "present", check_in: "07:00", check_out: "17:00", total_hours: 10, late_minutes: 0 },
    { employee_id: empByCode["EMP-102"], date: "2026-06-13", status: "absent", check_in: null, check_out: null, total_hours: null, late_minutes: 0 },
    { employee_id: empByCode["EMP-103"], date: "2026-06-15", status: "leave", check_in: null, check_out: null, total_hours: null, late_minutes: 0 },
  ], "employee_id,date");
  console.log("  ✓ attendance");

  // ---- Overtime ------------------------------------------------------
  await seedIfEmpty("overtime", [
    { employee_id: empByCode["EMP-101"], date: "2026-06-14", start_time: "08:00", end_time: "20:00", total_hours: 12, standard_hours: 8, approval: "approved" },
    { employee_id: empByCode["EMP-102"], date: "2026-06-13", start_time: "08:00", end_time: "18:00", total_hours: 10, standard_hours: 8, approval: "pending" },
  ]);
  console.log("  ✓ overtime");

  // ---- Fuel expenses -------------------------------------------------
  await seedIfEmpty("fuel_expenses", [
    { vehicle_id: vehId, employee_id: empByCode["EMP-101"], date: "2026-06-12", liters: 60, amount: 138, approval: "approved" },
    { vehicle_id: vehId, employee_id: empByCode["EMP-101"], date: "2026-06-08", liters: 55, amount: 126.5, approval: "pending" },
  ]);
  console.log("  ✓ fuel expenses");

  console.log("\n✅ Sample data seeded. Open /employees, /inspections, /payroll, /attendance, /fuel, /clients to view.");
}

main().catch((e) => { console.error("\n❌ Seed failed:\n", e.message); process.exit(1); });
