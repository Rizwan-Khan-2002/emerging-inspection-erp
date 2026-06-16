import { z } from "zod";

const money = () => z.coerce.number().min(0).optional();

export const employeeSchema = z.object({
  employee_code: z.string().min(1, "Code is required"),
  full_name: z.string().min(2, "Name is required"),
  iqama_passport: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  basic_salary: z.coerce.number().min(0),
  ot_rate: z.coerce.number().min(0),
  ot_rate_holiday: money(),
  allow_food: money(),
  allow_accommodation: money(),
  allow_telephone: money(),
  allow_carwash: money(),
  deduct_fuel: money(),
  deduct_car_emi: money(),
  phone: z.string().optional(),
  email: z.string().email("Valid email").optional().or(z.literal("")),
  bank_iban: z.string().optional(),
  status: z.enum(["active", "on_leave", "inactive"]),
  join_date: z.string().optional(),
});
export type EmployeeFormValues = z.infer<typeof employeeSchema>;

export const projectSchema = z.object({
  name: z.string().min(2, "Project name is required"),
  client_id: z.string().optional(),
  site_location: z.string().optional(),
  status: z.enum(["planning", "active", "on_hold", "completed"]),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  budget: z.coerce.number().min(0).optional(),
});
export type ProjectFormValues = z.infer<typeof projectSchema>;

export const clientSchema = z.object({
  company_name: z.string().min(2, "Company name is required"),
  industry: z.string().optional(),
  contact_person: z.string().optional(),
  email: z.string().email("Valid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().min(1),
  vat_number: z.string().optional(),
  payment_terms: z.string().optional(),
});
export type ClientFormValues = z.infer<typeof clientSchema>;

export const vehicleSchema = z.object({
  plate_number: z.string().min(1, "Plate number is required"),
  make_model: z.string().optional(),
  insurance_expiry: z.string().optional(),
  mileage: z.coerce.number().min(0).optional(),
  next_service_date: z.string().optional(),
  status: z.enum(["active", "maintenance", "inactive"]),
});
export type VehicleFormValues = z.infer<typeof vehicleSchema>;

export const quotationSchema = z.object({
  client_id: z.string().min(1, "Client is required"),
  amount: z.coerce.number().min(0),
  valid_until: z.string().optional(),
  status: z.enum(["draft", "sent", "accepted", "rejected"]),
});
export type QuotationFormValues = z.infer<typeof quotationSchema>;

export const invoiceSchema = z.object({
  client_id: z.string().min(1, "Client is required"),
  amount: z.coerce.number().min(0),
  due_date: z.string().optional(),
  status: z.enum(["draft", "sent", "paid", "overdue"]),
});
export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export const payrollSchema = z.object({
  employee_id: z.string().min(1, "Employee is required"),
  period: z.string().min(1, "Period is required"),
  basic_salary: z.coerce.number().min(0),
  ot_amount: z.coerce.number().min(0),
  allowances: z.coerce.number().min(0),
  deductions: z.coerce.number().min(0),
  status: z.enum(["draft", "approved", "paid"]),
});
export type PayrollFormValues = z.infer<typeof payrollSchema>;

export const fuelSchema = z.object({
  vehicle_id: z.string().min(1, "Vehicle is required"),
  employee_id: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  liters: z.coerce.number().min(0),
  amount: z.coerce.number().min(0),
});
export type FuelFormValues = z.infer<typeof fuelSchema>;

export const overtimeSchema = z.object({
  employee_id: z.string().min(1, "Employee is required"),
  date: z.string().min(1, "Date is required"),
  start_time: z.string().min(1, "Start time required"),
  end_time: z.string().min(1, "End time required"),
  total_hours: z.coerce.number().min(0),
});
export type OvertimeFormValues = z.infer<typeof overtimeSchema>;

export const attendanceSchema = z.object({
  employee_id: z.string().min(1, "Employee is required"),
  date: z.string().min(1, "Date is required"),
  status: z.enum(["present", "absent", "leave", "half_day", "night_shift"]),
  check_in: z.string().optional(),
  check_out: z.string().optional(),
  total_hours: z.coerce.number().min(0).optional(),
  late_minutes: z.coerce.number().min(0).optional(),
});
export type AttendanceFormValues = z.infer<typeof attendanceSchema>;

export const teamMemberSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Min 6 characters"),
  role: z.enum(["super_admin", "owner", "admin", "hr", "coordinator", "inspector", "client"]),
});
export type TeamMemberFormValues = z.infer<typeof teamMemberSchema>;

export const expenseSchema = z.object({
  employee_id: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  amount: z.coerce.number().min(0),
});
export type ExpenseFormValues = z.infer<typeof expenseSchema>;

export const companySchema = z.object({
  company_name: z.string().min(2, "Company name is required"),
  legal_name: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  vat_number: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Valid email").optional().or(z.literal("")),
  currency: z.string().optional(),
  vat_percent: z.coerce.number().min(0).max(100).optional(),
});
export type CompanyFormValues = z.infer<typeof companySchema>;
