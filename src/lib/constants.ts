import type {
  AttendanceStatus,
  InspectionType,
  JobStatus,
  LeadStatus,
  Priority,
  ReportStatus,
  Role,
} from "./types";

export const APP_NAME = "Emerging Inspection ERP";
export const APP_SHORT = "Emerging ERP";

/* ---------------------------------- Roles --------------------------------- */

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  owner: "Company Owner",
  admin: "Admin",
  hr: "HR Manager",
  coordinator: "Coordinator",
  inspector: "Inspector",
  client: "Client",
};

export const ROLES: Role[] = [
  "super_admin",
  "owner",
  "admin",
  "hr",
  "coordinator",
  "inspector",
  "client",
];

/* ------------------------------- Navigation ------------------------------- */

export type NavItem = {
  label: string;
  href: string;
  icon: string; // lucide icon name
  roles: Role[]; // roles allowed to see this item
  group: "Overview" | "Sales & CRM" | "Operations" | "Workforce" | "Fleet" | "Finance" | "System";
  badge?: string;
};

const ALL: Role[] = ["super_admin", "owner", "admin", "hr", "coordinator", "inspector", "client"];

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", roles: ALL, group: "Overview" },

  { label: "Leads CRM", href: "/leads", icon: "Target", roles: ["super_admin", "owner", "admin", "coordinator"], group: "Sales & CRM" },
  { label: "Clients", href: "/clients", icon: "Building2", roles: ["super_admin", "owner", "admin", "coordinator"], group: "Sales & CRM" },
  { label: "Quotations", href: "/quotations", icon: "FileText", roles: ["super_admin", "owner", "admin", "coordinator"], group: "Sales & CRM" },
  { label: "Invoices", href: "/invoices", icon: "Receipt", roles: ["super_admin", "owner", "admin"], group: "Sales & CRM" },

  { label: "Inspections", href: "/inspections", icon: "ClipboardCheck", roles: ["super_admin", "owner", "admin", "coordinator", "inspector"], group: "Operations" },
  { label: "Reports", href: "/reports", icon: "FileCheck2", roles: ["super_admin", "owner", "admin", "coordinator", "inspector", "client"], group: "Operations" },
  { label: "Field Ops", href: "/field-ops", icon: "MapPin", roles: ["super_admin", "owner", "admin", "coordinator", "inspector"], group: "Operations" },
  { label: "Projects", href: "/projects", icon: "FolderKanban", roles: ["super_admin", "owner", "admin", "coordinator"], group: "Operations" },

  { label: "Employees", href: "/employees", icon: "Users", roles: ["super_admin", "owner", "admin", "hr"], group: "Workforce" },
  { label: "Attendance", href: "/attendance", icon: "CalendarCheck", roles: ["super_admin", "owner", "admin", "hr", "coordinator"], group: "Workforce" },
  { label: "Overtime", href: "/overtime", icon: "Clock", roles: ["super_admin", "owner", "admin", "hr", "coordinator"], group: "Workforce" },
  { label: "Payroll", href: "/payroll", icon: "Wallet", roles: ["super_admin", "owner", "admin", "hr"], group: "Workforce" },

  { label: "Vehicles", href: "/vehicles", icon: "Truck", roles: ["super_admin", "owner", "admin", "coordinator"], group: "Fleet" },
  { label: "Fuel Expenses", href: "/fuel", icon: "Fuel", roles: ["super_admin", "owner", "admin", "coordinator", "inspector"], group: "Fleet" },

  { label: "Expense Claims", href: "/expenses", icon: "ReceiptText", roles: ["super_admin", "owner", "admin", "hr", "coordinator", "inspector"], group: "Finance" },
  { label: "Documents", href: "/documents", icon: "Files", roles: ["super_admin", "owner", "admin", "hr", "coordinator"], group: "Finance" },

  { label: "Users & Roles", href: "/users", icon: "ShieldCheck", roles: ["super_admin", "owner", "admin"], group: "System" },
  { label: "Settings", href: "/settings", icon: "Settings", roles: ALL, group: "System" },
];

export const NAV_GROUP_ORDER = [
  "Overview",
  "Sales & CRM",
  "Operations",
  "Workforce",
  "Fleet",
  "Finance",
  "System",
] as const;

export function navForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((i) => i.roles.includes(role));
}

/* ------------------------------ Status badges ----------------------------- */

export type BadgeTone = "neutral" | "info" | "warning" | "success" | "danger" | "accent" | "purple";

export const LEAD_STATUS: Record<LeadStatus, { label: string; tone: BadgeTone }> = {
  new: { label: "New", tone: "info" },
  contacted: { label: "Contacted", tone: "neutral" },
  follow_up: { label: "Follow-up", tone: "warning" },
  interested: { label: "Interested", tone: "accent" },
  quotation_sent: { label: "Quotation Sent", tone: "purple" },
  negotiation: { label: "Negotiation", tone: "warning" },
  won: { label: "Won", tone: "success" },
  lost: { label: "Lost", tone: "danger" },
};

export const JOB_STATUS: Record<JobStatus, { label: string; tone: BadgeTone }> = {
  pending: { label: "Pending", tone: "neutral" },
  assigned: { label: "Assigned", tone: "info" },
  in_progress: { label: "In Progress", tone: "accent" },
  submitted: { label: "Submitted", tone: "purple" },
  under_review: { label: "Under Review", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  sent_to_client: { label: "Sent to Client", tone: "info" },
  closed: { label: "Closed", tone: "neutral" },
};

export const REPORT_STATUS: Record<ReportStatus, { label: string; tone: BadgeTone }> = {
  draft: { label: "Draft", tone: "neutral" },
  submitted: { label: "Submitted", tone: "info" },
  pending_review: { label: "Pending Review", tone: "warning" },
  needs_correction: { label: "Needs Correction", tone: "danger" },
  approved: { label: "Approved", tone: "success" },
  sent_to_client: { label: "Sent to Client", tone: "info" },
  closed: { label: "Closed", tone: "neutral" },
};

export const PRIORITY: Record<Priority, { label: string; tone: BadgeTone }> = {
  low: { label: "Low", tone: "neutral" },
  medium: { label: "Medium", tone: "info" },
  high: { label: "High", tone: "warning" },
  critical: { label: "Critical", tone: "danger" },
};

export const ATTENDANCE_STATUS: Record<AttendanceStatus, { label: string; tone: BadgeTone }> = {
  present: { label: "Present", tone: "success" },
  absent: { label: "Absent", tone: "danger" },
  leave: { label: "Leave", tone: "warning" },
  half_day: { label: "Half Day", tone: "info" },
  night_shift: { label: "Night Shift", tone: "purple" },
};

export const INSPECTION_TYPE: Record<InspectionType, string> = {
  scaffolding: "Scaffolding Inspection",
  ndt: "NDT",
  qaqc: "QA/QC",
  mechanical: "Mechanical Inspection",
  electrical: "Electrical Inspection",
  safety: "Safety Inspection",
  civil: "Civil Inspection",
  lifting: "Lifting Equipment Inspection",
};

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  website: "Website",
  referral: "Referral",
  linkedin: "LinkedIn",
  cold_email: "Cold Email",
  exhibition: "Exhibition",
  whatsapp: "WhatsApp",
  other: "Other",
};

/** Standard duty hours for OT calculation: total - standard = OT. */
export const STANDARD_DUTY_HOURS = 8;
