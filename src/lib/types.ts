/**
 * Domain types — mirror the PostgreSQL/Supabase schema in /supabase/schema.sql.
 * Kept framework-agnostic so they can be shared between server and client.
 */

export type Role =
  | "super_admin"
  | "owner"
  | "admin"
  | "hr"
  | "coordinator"
  | "inspector"
  | "client";

export type LeadStatus =
  | "new"
  | "contacted"
  | "follow_up"
  | "interested"
  | "quotation_sent"
  | "negotiation"
  | "won"
  | "lost";

export type LeadSource =
  | "website"
  | "referral"
  | "linkedin"
  | "cold_email"
  | "exhibition"
  | "whatsapp"
  | "other";

export type InspectionType =
  | "scaffolding"
  | "ndt"
  | "qaqc"
  | "mechanical"
  | "electrical"
  | "safety"
  | "civil"
  | "lifting";

export type JobStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "submitted"
  | "under_review"
  | "approved"
  | "sent_to_client"
  | "closed";

export type Priority = "low" | "medium" | "high" | "critical";

export type ReportStatus =
  | "draft"
  | "submitted"
  | "pending_review"
  | "needs_correction"
  | "approved"
  | "sent_to_client"
  | "closed";

export type AttendanceStatus =
  | "present"
  | "absent"
  | "leave"
  | "half_day"
  | "night_shift";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  phone?: string;
  avatar_url?: string;
  active: boolean;
}

export interface Lead {
  id: string;
  company_name: string;
  industry: string;
  contact_person: string;
  position?: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  country: string;
  city?: string;
  source: LeadSource;
  status: LeadStatus;
  notes?: string;
  follow_up_date?: string | null;
  estimated_value?: number;
  owner_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  company_name: string;
  industry?: string;
  contact_person: string;
  email: string;
  phone?: string;
  city?: string;
  country: string;
  vat_number?: string;
  payment_terms?: string;
  outstanding_balance: number;
  active: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  client_id: string;
  client_name?: string;
  site_location?: string;
  status: "planning" | "active" | "on_hold" | "completed";
  start_date?: string;
  end_date?: string;
  budget?: number;
}

export interface Inspection {
  id: string;
  ref: string;
  type: InspectionType;
  client_id: string;
  client_name: string;
  project_id?: string;
  project_name?: string;
  site_location: string;
  lat?: number;
  lng?: number;
  inspector_id?: string;
  inspector_name?: string;
  coordinator_id?: string;
  coordinator_name?: string;
  scheduled_at: string;
  priority: Priority;
  status: JobStatus;
  checklist?: ChecklistItem[];
  photos?: string[];
  remarks?: string;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  result: "pass" | "fail" | "na" | "pending";
  note?: string;
}

export interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  iqama_passport?: string;
  position: string;
  department?: string;
  basic_salary: number;
  ot_rate: number;
  phone?: string;
  email?: string;
  bank_iban?: string;
  assigned_vehicle?: string;
  status: "active" | "on_leave" | "inactive";
  join_date?: string;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  status: AttendanceStatus;
  check_in?: string;
  check_out?: string;
  total_hours?: number;
  late_minutes?: number;
}

export interface OvertimeRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  project_name?: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  standard_hours: number;
  ot_hours: number;
  approval: ApprovalStatus;
  approved_by?: string;
}

export interface PayrollRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  period: string; // YYYY-MM
  basic_salary: number;
  ot_amount: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  status: "draft" | "approved" | "paid";
}

export interface Vehicle {
  id: string;
  plate_number: string;
  make_model?: string;
  assigned_employee?: string;
  insurance_expiry?: string;
  mileage?: number;
  next_service_date?: string;
  status: "active" | "maintenance" | "inactive";
}

export interface FuelExpense {
  id: string;
  vehicle_plate: string;
  employee_name: string;
  project_name?: string;
  date: string;
  liters: number;
  amount: number;
  receipt_url?: string;
  approval: ApprovalStatus;
}

export interface InspectionReport {
  id: string;
  inspection_ref: string;
  client_name: string;
  type: InspectionType;
  inspector_name: string;
  status: ReportStatus;
  submitted_at?: string;
  created_at: string;
}

export interface Quotation {
  id: string;
  number: string;
  client_name: string;
  amount: number;
  status: "draft" | "sent" | "accepted" | "rejected";
  valid_until?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  number: string;
  client_name: string;
  amount: number;
  vat: number;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue";
  due_date?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  type: "info" | "success" | "warning" | "danger";
  read: boolean;
  created_at: string;
}

export interface DashboardStats {
  totalLeads: number;
  wonClients: number;
  activeProjects: number;
  monthlyRevenue: number;
  payrollExpense: number;
  fuelExpense: number;
  activeInspectors: number;
  pendingReports: number;
  vehiclesInUse: number;
  todayInspections: number;
  otHoursMonth: number;
  fuelClaimsPending: number;
}
