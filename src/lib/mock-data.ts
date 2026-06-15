import type {
  AttendanceRecord,
  Client,
  DashboardStats,
  Employee,
  FuelExpense,
  Inspection,
  InspectionReport,
  Invoice,
  Lead,
  NotificationItem,
  OvertimeRecord,
  PayrollRecord,
  Project,
  Quotation,
  Vehicle,
} from "./types";

/* --------------------------------- Leads ---------------------------------- */

export const mockLeads: Lead[] = [
  { id: "L-1001", company_name: "SABIC Jubail", industry: "Petrochemical", contact_person: "Khalid Al-Otaibi", position: "Procurement Manager", email: "k.otaibi@sabic-demo.com", phone: "+966551112233", whatsapp: "+966551112233", country: "Saudi Arabia", city: "Jubail", source: "referral", status: "negotiation", notes: "Needs scaffolding + NDT for shutdown 2026.", follow_up_date: "2026-06-18", estimated_value: 480000, created_at: "2026-05-20T09:00:00Z", updated_at: "2026-06-12T09:00:00Z" },
  { id: "L-1002", company_name: "Aramco Yanbu", industry: "Oil & Gas", contact_person: "Mohammed Saleh", position: "Maintenance Lead", email: "m.saleh@aramco-demo.com", phone: "+966552223344", whatsapp: "+966552223344", country: "Saudi Arabia", city: "Yanbu", source: "exhibition", status: "quotation_sent", notes: "Sent quote for lifting equipment inspection.", follow_up_date: "2026-06-16", estimated_value: 220000, created_at: "2026-05-28T09:00:00Z", updated_at: "2026-06-10T09:00:00Z" },
  { id: "L-1003", company_name: "Ma'aden Phosphate", industry: "Mining", contact_person: "Aisha Khan", position: "QA/QC Head", email: "a.khan@maaden-demo.com", phone: "+966553334455", whatsapp: "+966553334455", country: "Saudi Arabia", city: "Ras Al Khair", source: "linkedin", status: "interested", notes: "Interested in annual QA/QC contract.", follow_up_date: "2026-06-20", estimated_value: 650000, created_at: "2026-06-01T09:00:00Z", updated_at: "2026-06-11T09:00:00Z" },
  { id: "L-1004", company_name: "ADNOC Ruwais", industry: "Oil & Gas", contact_person: "Omar Farouk", position: "Project Engineer", email: "o.farouk@adnoc-demo.com", phone: "+971501234567", whatsapp: "+971501234567", country: "UAE", city: "Abu Dhabi", source: "website", status: "new", notes: "Inbound enquiry from website form.", follow_up_date: "2026-06-17", estimated_value: 130000, created_at: "2026-06-13T09:00:00Z", updated_at: "2026-06-13T09:00:00Z" },
  { id: "L-1005", company_name: "SEC Power Plant", industry: "Power", contact_person: "Yousef Nasser", position: "Electrical Manager", email: "y.nasser@sec-demo.com", phone: "+966554445566", whatsapp: "+966554445566", country: "Saudi Arabia", city: "Riyadh", source: "cold_email", status: "contacted", notes: "Replied to cold email, awaiting call.", follow_up_date: "2026-06-19", estimated_value: 90000, created_at: "2026-06-05T09:00:00Z", updated_at: "2026-06-09T09:00:00Z" },
  { id: "L-1006", company_name: "Sadara Chemical", industry: "Chemical", contact_person: "Hassan Ali", position: "Reliability Engineer", email: "h.ali@sadara-demo.com", phone: "+966555556677", whatsapp: "+966555556677", country: "Saudi Arabia", city: "Jubail", source: "referral", status: "won", notes: "Converted — annual mechanical inspection deal.", follow_up_date: null, estimated_value: 410000, created_at: "2026-04-15T09:00:00Z", updated_at: "2026-06-02T09:00:00Z" },
  { id: "L-1007", company_name: "Petro Rabigh", industry: "Petrochemical", contact_person: "Nora Ahmed", position: "HSE Manager", email: "n.ahmed@rabigh-demo.com", phone: "+966556667788", whatsapp: "+966556667788", country: "Saudi Arabia", city: "Rabigh", source: "exhibition", status: "follow_up", notes: "Met at GPCA expo, send safety inspection profile.", follow_up_date: "2026-06-15", estimated_value: 175000, created_at: "2026-05-30T09:00:00Z", updated_at: "2026-06-08T09:00:00Z" },
  { id: "L-1008", company_name: "Gulf Steel Works", industry: "Manufacturing", contact_person: "Tariq Mahmood", position: "Plant Director", email: "t.mahmood@gulfsteel-demo.com", phone: "+971509998877", whatsapp: "+971509998877", country: "UAE", city: "Dubai", source: "whatsapp", status: "lost", notes: "Chose competitor on price.", follow_up_date: null, estimated_value: 60000, created_at: "2026-05-10T09:00:00Z", updated_at: "2026-05-25T09:00:00Z" },
];

/* -------------------------------- Clients --------------------------------- */

export const mockClients: Client[] = [
  { id: "C-001", company_name: "Sadara Chemical", industry: "Chemical", contact_person: "Hassan Ali", email: "h.ali@sadara-demo.com", phone: "+966555556677", city: "Jubail", country: "Saudi Arabia", vat_number: "300012345600003", payment_terms: "Net 30", outstanding_balance: 125000, active: true, created_at: "2026-04-20T09:00:00Z" },
  { id: "C-002", company_name: "SABIC Jubail", industry: "Petrochemical", contact_person: "Khalid Al-Otaibi", email: "k.otaibi@sabic-demo.com", phone: "+966551112233", city: "Jubail", country: "Saudi Arabia", vat_number: "300011112200003", payment_terms: "Net 45", outstanding_balance: 0, active: true, created_at: "2026-03-12T09:00:00Z" },
  { id: "C-003", company_name: "Ma'aden Phosphate", industry: "Mining", contact_person: "Aisha Khan", email: "a.khan@maaden-demo.com", phone: "+966553334455", city: "Ras Al Khair", country: "Saudi Arabia", vat_number: "300033334400003", payment_terms: "Net 30", outstanding_balance: 48000, active: true, created_at: "2026-05-02T09:00:00Z" },
];

/* -------------------------------- Projects -------------------------------- */

export const mockProjects: Project[] = [
  { id: "P-101", name: "Sadara Shutdown 2026", client_id: "C-001", client_name: "Sadara Chemical", site_location: "Jubail Industrial City", status: "active", start_date: "2026-06-01", end_date: "2026-07-15", budget: 410000 },
  { id: "P-102", name: "SABIC Plant 4 QA/QC", client_id: "C-002", client_name: "SABIC Jubail", site_location: "Jubail", status: "active", start_date: "2026-05-20", end_date: "2026-08-20", budget: 300000 },
  { id: "P-103", name: "Ma'aden Lifting Survey", client_id: "C-003", client_name: "Ma'aden Phosphate", site_location: "Ras Al Khair", status: "planning", start_date: "2026-06-25", budget: 90000 },
];

/* ------------------------------ Inspections ------------------------------- */

export const mockInspections: Inspection[] = [
  { id: "I-5001", ref: "INS-2026-5001", type: "scaffolding", client_id: "C-001", client_name: "Sadara Chemical", project_id: "P-101", project_name: "Sadara Shutdown 2026", site_location: "Unit 7, Jubail Industrial City", lat: 27.0174, lng: 49.6225, inspector_id: "u-insp", inspector_name: "Bilal Inspector", coordinator_id: "u-coord", coordinator_name: "Imran Coordinator", scheduled_at: "2026-06-15T06:00:00Z", priority: "high", status: "in_progress", remarks: "Scaffold tag inspection across Unit 7.", checklist: [ { id: "c1", label: "Base plates & sole boards", result: "pass" }, { id: "c2", label: "Standards plumb & spacing", result: "pass" }, { id: "c3", label: "Guardrails & toe boards", result: "fail", note: "Missing toe board level 3" }, { id: "c4", label: "Access ladder secured", result: "pending" } ], photos: [], created_at: "2026-06-14T09:00:00Z" },
  { id: "I-5002", ref: "INS-2026-5002", type: "qaqc", client_id: "C-002", client_name: "SABIC Jubail", project_id: "P-102", project_name: "SABIC Plant 4 QA/QC", site_location: "Plant 4, Jubail", lat: 27.0046, lng: 49.6583, inspector_id: "u-insp", inspector_name: "Bilal Inspector", coordinator_id: "u-coord", coordinator_name: "Imran Coordinator", scheduled_at: "2026-06-15T05:30:00Z", priority: "medium", status: "assigned", remarks: "Weld visual + dimensional check.", checklist: [], photos: [], created_at: "2026-06-13T09:00:00Z" },
  { id: "I-5003", ref: "INS-2026-5003", type: "lifting", client_id: "C-003", client_name: "Ma'aden Phosphate", project_id: "P-103", project_name: "Ma'aden Lifting Survey", site_location: "Ras Al Khair Port", lat: 27.5236, lng: 49.2042, coordinator_id: "u-coord", coordinator_name: "Imran Coordinator", scheduled_at: "2026-06-16T07:00:00Z", priority: "critical", status: "pending", remarks: "Annual crane & sling certification.", checklist: [], photos: [], created_at: "2026-06-12T09:00:00Z" },
  { id: "I-5004", ref: "INS-2026-5004", type: "ndt", client_id: "C-001", client_name: "Sadara Chemical", project_id: "P-101", project_name: "Sadara Shutdown 2026", site_location: "Unit 3, Jubail", lat: 27.0174, lng: 49.6225, inspector_id: "u-insp", inspector_name: "Bilal Inspector", coordinator_id: "u-coord", coordinator_name: "Imran Coordinator", scheduled_at: "2026-06-12T06:00:00Z", priority: "high", status: "under_review", remarks: "UT thickness survey on piping.", checklist: [], photos: [], created_at: "2026-06-11T09:00:00Z" },
  { id: "I-5005", ref: "INS-2026-5005", type: "safety", client_id: "C-002", client_name: "SABIC Jubail", site_location: "Warehouse B, Jubail", lat: 27.0046, lng: 49.6583, inspector_id: "u-insp", inspector_name: "Bilal Inspector", coordinator_id: "u-coord", coordinator_name: "Imran Coordinator", scheduled_at: "2026-06-10T08:00:00Z", priority: "low", status: "sent_to_client", remarks: "Fire & egress safety audit.", checklist: [], photos: [], created_at: "2026-06-09T09:00:00Z" },
  { id: "I-5006", ref: "INS-2026-5006", type: "mechanical", client_id: "C-001", client_name: "Sadara Chemical", project_id: "P-101", project_name: "Sadara Shutdown 2026", site_location: "Pump House, Jubail", lat: 27.0174, lng: 49.6225, inspector_id: "u-insp", inspector_name: "Bilal Inspector", coordinator_id: "u-coord", coordinator_name: "Imran Coordinator", scheduled_at: "2026-06-08T06:30:00Z", priority: "medium", status: "approved", remarks: "Rotating equipment alignment check.", checklist: [], photos: [], created_at: "2026-06-07T09:00:00Z" },
];

/* -------------------------------- Employees ------------------------------- */

export const mockEmployees: Employee[] = [
  { id: "E-001", employee_code: "EMP-001", full_name: "Bilal Inspector", iqama_passport: "2412345678", position: "Senior Inspector", department: "Operations", basic_salary: 6500, ot_rate: 45, phone: "+966500000006", email: "field@emerginginspection.com", bank_iban: "SA0380000000608010167519", assigned_vehicle: "JUB-4471", status: "active", join_date: "2024-02-01" },
  { id: "E-002", employee_code: "EMP-002", full_name: "Imran Coordinator", iqama_passport: "2498765432", position: "Operations Coordinator", department: "Operations", basic_salary: 9000, ot_rate: 60, phone: "+966500000005", email: "ops@emerginginspection.com", bank_iban: "SA0380000000608010167520", status: "active", join_date: "2023-09-15" },
  { id: "E-003", employee_code: "EMP-003", full_name: "Ahmed NDT Tech", iqama_passport: "2411223344", position: "NDT Technician", department: "Operations", basic_salary: 5800, ot_rate: 40, phone: "+966500000011", assigned_vehicle: "JUB-2210", status: "active", join_date: "2024-06-10" },
  { id: "E-004", employee_code: "EMP-004", full_name: "Sara HR", iqama_passport: "2455667788", position: "HR Manager", department: "HR", basic_salary: 8500, ot_rate: 0, phone: "+966500000004", email: "hr@emerginginspection.com", status: "active", join_date: "2023-01-05" },
  { id: "E-005", employee_code: "EMP-005", full_name: "Yasir Scaffolder", iqama_passport: "2433445566", position: "Scaffolding Inspector", department: "Operations", basic_salary: 5200, ot_rate: 38, phone: "+966500000012", assigned_vehicle: "JUB-9003", status: "on_leave", join_date: "2024-11-20" },
];

/* ------------------------------- Attendance ------------------------------- */

export const mockAttendance: AttendanceRecord[] = [
  { id: "A-1", employee_id: "E-001", employee_name: "Bilal Inspector", date: "2026-06-15", status: "present", check_in: "05:55", check_out: "17:10", total_hours: 11.25, late_minutes: 0 },
  { id: "A-2", employee_id: "E-003", employee_name: "Ahmed NDT Tech", date: "2026-06-15", status: "night_shift", check_in: "18:00", check_out: "06:00", total_hours: 12, late_minutes: 0 },
  { id: "A-3", employee_id: "E-005", employee_name: "Yasir Scaffolder", date: "2026-06-15", status: "leave" },
  { id: "A-4", employee_id: "E-002", employee_name: "Imran Coordinator", date: "2026-06-15", status: "present", check_in: "07:12", check_out: "16:00", total_hours: 8.8, late_minutes: 12 },
];

/* -------------------------------- Overtime -------------------------------- */

export const mockOvertime: OvertimeRecord[] = [
  { id: "OT-1", employee_id: "E-001", employee_name: "Bilal Inspector", date: "2026-06-15", project_name: "Sadara Shutdown 2026", start_time: "06:00", end_time: "17:00", total_hours: 11, standard_hours: 8, ot_hours: 3, approval: "pending" },
  { id: "OT-2", employee_id: "E-003", employee_name: "Ahmed NDT Tech", date: "2026-06-14", project_name: "Sadara Shutdown 2026", start_time: "18:00", end_time: "06:00", total_hours: 12, standard_hours: 8, ot_hours: 4, approval: "approved", approved_by: "Imran Coordinator" },
  { id: "OT-3", employee_id: "E-001", employee_name: "Bilal Inspector", date: "2026-06-13", project_name: "SABIC Plant 4 QA/QC", start_time: "05:30", end_time: "15:30", total_hours: 10, standard_hours: 8, ot_hours: 2, approval: "approved", approved_by: "Imran Coordinator" },
];

/* --------------------------------- Payroll -------------------------------- */

export const mockPayroll: PayrollRecord[] = [
  { id: "PR-1", employee_id: "E-001", employee_name: "Bilal Inspector", period: "2026-05", basic_salary: 6500, ot_amount: 1350, allowances: 800, deductions: 200, net_salary: 8450, status: "paid" },
  { id: "PR-2", employee_id: "E-002", employee_name: "Imran Coordinator", period: "2026-05", basic_salary: 9000, ot_amount: 0, allowances: 1200, deductions: 300, net_salary: 9900, status: "paid" },
  { id: "PR-3", employee_id: "E-003", employee_name: "Ahmed NDT Tech", period: "2026-05", basic_salary: 5800, ot_amount: 960, allowances: 600, deductions: 150, net_salary: 7210, status: "approved" },
];

/* -------------------------------- Vehicles -------------------------------- */

export const mockVehicles: Vehicle[] = [
  { id: "V-1", plate_number: "JUB-4471", make_model: "Toyota Hilux 2023", assigned_employee: "Bilal Inspector", insurance_expiry: "2026-11-01", mileage: 84200, next_service_date: "2026-06-25", status: "active" },
  { id: "V-2", plate_number: "JUB-2210", make_model: "Nissan Patrol 2022", assigned_employee: "Ahmed NDT Tech", insurance_expiry: "2026-08-15", mileage: 121000, next_service_date: "2026-06-18", status: "active" },
  { id: "V-3", plate_number: "JUB-9003", make_model: "Toyota Land Cruiser 2021", assigned_employee: "Yasir Scaffolder", insurance_expiry: "2026-07-02", mileage: 156400, next_service_date: "2026-07-05", status: "maintenance" },
];

/* ------------------------------ Fuel expenses ----------------------------- */

export const mockFuel: FuelExpense[] = [
  { id: "F-1", vehicle_plate: "JUB-4471", employee_name: "Bilal Inspector", project_name: "Sadara Shutdown 2026", date: "2026-06-14", liters: 60, amount: 138, approval: "pending" },
  { id: "F-2", vehicle_plate: "JUB-2210", employee_name: "Ahmed NDT Tech", project_name: "Sadara Shutdown 2026", date: "2026-06-13", liters: 75, amount: 172.5, approval: "approved" },
  { id: "F-3", vehicle_plate: "JUB-9003", employee_name: "Yasir Scaffolder", date: "2026-06-10", liters: 55, amount: 126.5, approval: "pending" },
];

/* -------------------------------- Reports --------------------------------- */

export const mockReports: InspectionReport[] = [
  { id: "R-1", inspection_ref: "INS-2026-5004", client_name: "Sadara Chemical", type: "ndt", inspector_name: "Bilal Inspector", status: "pending_review", submitted_at: "2026-06-13T10:00:00Z", created_at: "2026-06-13T10:00:00Z" },
  { id: "R-2", inspection_ref: "INS-2026-5005", client_name: "SABIC Jubail", type: "safety", inspector_name: "Bilal Inspector", status: "sent_to_client", submitted_at: "2026-06-10T14:00:00Z", created_at: "2026-06-10T14:00:00Z" },
  { id: "R-3", inspection_ref: "INS-2026-5006", client_name: "Sadara Chemical", type: "mechanical", inspector_name: "Bilal Inspector", status: "approved", submitted_at: "2026-06-08T16:00:00Z", created_at: "2026-06-08T16:00:00Z" },
];

/* ------------------------- Quotations & Invoices -------------------------- */

export const mockQuotations: Quotation[] = [
  { id: "Q-1", number: "QT-2026-0042", client_name: "Aramco Yanbu", amount: 220000, status: "sent", valid_until: "2026-06-30", created_at: "2026-06-09T09:00:00Z" },
  { id: "Q-2", number: "QT-2026-0041", client_name: "SABIC Jubail", amount: 480000, status: "sent", valid_until: "2026-06-25", created_at: "2026-06-05T09:00:00Z" },
  { id: "Q-3", number: "QT-2026-0040", client_name: "Sadara Chemical", amount: 410000, status: "accepted", valid_until: "2026-05-30", created_at: "2026-04-28T09:00:00Z" },
];

export const mockInvoices: Invoice[] = [
  { id: "INV-1", number: "INV-2026-0188", client_name: "Sadara Chemical", amount: 125000, vat: 18750, total: 143750, status: "sent", due_date: "2026-06-30", created_at: "2026-06-01T09:00:00Z" },
  { id: "INV-2", number: "INV-2026-0187", client_name: "Ma'aden Phosphate", amount: 48000, vat: 7200, total: 55200, status: "overdue", due_date: "2026-06-05", created_at: "2026-05-06T09:00:00Z" },
  { id: "INV-3", number: "INV-2026-0186", client_name: "SABIC Jubail", amount: 300000, vat: 45000, total: 345000, status: "paid", due_date: "2026-05-20", created_at: "2026-04-20T09:00:00Z" },
];

/* ------------------------------ Notifications ----------------------------- */

export const mockNotifications: NotificationItem[] = [
  { id: "N-1", title: "Report pending review", body: "NDT report INS-2026-5004 submitted by Bilal.", type: "warning", read: false, created_at: "2026-06-15T06:30:00Z" },
  { id: "N-2", title: "Fuel claim submitted", body: "JUB-4471 — 138 SAR awaiting approval.", type: "info", read: false, created_at: "2026-06-14T18:00:00Z" },
  { id: "N-3", title: "Vehicle service due", body: "JUB-2210 service due 18 Jun.", type: "danger", read: false, created_at: "2026-06-14T08:00:00Z" },
  { id: "N-4", title: "Lead won", body: "Sadara Chemical converted — 410,000 SAR.", type: "success", read: true, created_at: "2026-06-02T11:00:00Z" },
];

/* ----------------------------- Dashboard data ----------------------------- */

export const mockStats: DashboardStats = {
  totalLeads: mockLeads.length,
  wonClients: mockClients.length,
  activeProjects: mockProjects.filter((p) => p.status === "active").length,
  monthlyRevenue: 488750,
  payrollExpense: 25560,
  fuelExpense: 437,
  activeInspectors: mockEmployees.filter((e) => e.position.toLowerCase().includes("inspector") && e.status === "active").length,
  pendingReports: mockReports.filter((r) => r.status === "pending_review").length,
  vehiclesInUse: mockVehicles.filter((v) => v.status === "active").length,
  todayInspections: mockInspections.filter((i) => i.scheduled_at.startsWith("2026-06-15")).length,
  otHoursMonth: 142,
  fuelClaimsPending: mockFuel.filter((f) => f.approval === "pending").length,
};

export const revenueSeries = [
  { month: "Jan", revenue: 310000, expense: 180000 },
  { month: "Feb", revenue: 280000, expense: 175000 },
  { month: "Mar", revenue: 420000, expense: 210000 },
  { month: "Apr", revenue: 390000, expense: 205000 },
  { month: "May", revenue: 510000, expense: 240000 },
  { month: "Jun", revenue: 488750, expense: 232000 },
];

export const inspectionsByType = [
  { type: "Scaffolding", count: 28 },
  { type: "NDT", count: 19 },
  { type: "QA/QC", count: 24 },
  { type: "Lifting", count: 12 },
  { type: "Safety", count: 16 },
  { type: "Mechanical", count: 14 },
];

export const leadFunnel = [
  { stage: "New", value: 1 },
  { stage: "Contacted", value: 1 },
  { stage: "Follow-up", value: 1 },
  { stage: "Interested", value: 1 },
  { stage: "Quotation", value: 1 },
  { stage: "Negotiation", value: 1 },
  { stage: "Won", value: 1 },
];
