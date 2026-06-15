-- ====================================================================
-- EMERGING INSPECTION ERP — FULL SETUP (run once in Supabase SQL Editor)
-- Order: schema -> policies -> seed. Safe to re-run.
-- ====================================================================

-- =====================================================================
--  EMERGING INSPECTION ERP — PostgreSQL / Supabase schema
--  Run order: schema.sql → policies.sql → seed.sql
--  Safe to re-run (drops & recreates types/tables).
-- =====================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------
--  ENUM TYPES
-- ----------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('super_admin','owner','admin','hr','coordinator','inspector','client');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_status as enum ('new','contacted','follow_up','interested','quotation_sent','negotiation','won','lost');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_source as enum ('website','referral','linkedin','cold_email','exhibition','whatsapp','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type inspection_type as enum ('scaffolding','ndt','qaqc','mechanical','electrical','safety','civil','lifting');
exception when duplicate_object then null; end $$;

do $$ begin
  create type job_status as enum ('pending','assigned','in_progress','submitted','under_review','approved','sent_to_client','closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type priority_level as enum ('low','medium','high','critical');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_status as enum ('draft','submitted','pending_review','needs_correction','approved','sent_to_client','closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type attendance_status as enum ('present','absent','leave','half_day','night_shift');
exception when duplicate_object then null; end $$;

do $$ begin
  create type approval_status as enum ('pending','approved','rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_status as enum ('planning','active','on_hold','completed');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------
--  updated_at trigger helper
-- ----------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ======================================================================
--  PROFILES (1:1 with auth.users)
-- ======================================================================
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text not null,
  email        text unique not null,
  role         user_role not null default 'client',
  phone        text,
  avatar_url   text,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_profiles_role on profiles(role);

-- Auto-create a profile row when a new auth user signs up.
-- The FIRST user to register becomes super_admin (bootstrap); everyone
-- afterwards defaults to the role in their signup metadata, else 'client'.
create or replace function handle_new_user()
returns trigger as $$
declare
  first_user boolean;
begin
  select count(*) = 0 into first_user from public.profiles;
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    case
      when first_user then 'super_admin'::user_role
      else coalesce((new.raw_user_meta_data->>'role')::user_role, 'client')
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ======================================================================
--  CRM — LEADS
-- ======================================================================
create table if not exists leads (
  id              uuid primary key default uuid_generate_v4(),
  company_name    text not null,
  industry        text,
  contact_person  text not null,
  position        text,
  email           text,
  phone           text,
  whatsapp        text,
  country         text not null default 'Saudi Arabia',
  city            text,
  source          lead_source not null default 'website',
  status          lead_status not null default 'new',
  notes           text,
  follow_up_date  date,
  estimated_value numeric(14,2) default 0,
  owner_id        uuid references profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_leads_status on leads(status);
create index if not exists idx_leads_owner on leads(owner_id);
create index if not exists idx_leads_followup on leads(follow_up_date);
create trigger trg_leads_updated before update on leads for each row execute function set_updated_at();

-- Email/contact history per lead
create table if not exists lead_activities (
  id          uuid primary key default uuid_generate_v4(),
  lead_id     uuid not null references leads(id) on delete cascade,
  type        text not null,            -- email | call | whatsapp | note
  subject     text,
  body        text,
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists idx_lead_activities_lead on lead_activities(lead_id);

-- ======================================================================
--  CLIENTS & PROJECTS
-- ======================================================================
create table if not exists clients (
  id                  uuid primary key default uuid_generate_v4(),
  company_name        text not null,
  industry            text,
  contact_person      text,
  email               text,
  phone               text,
  city                text,
  country             text not null default 'Saudi Arabia',
  vat_number          text,
  payment_terms       text default 'Net 30',
  outstanding_balance numeric(14,2) not null default 0,
  active              boolean not null default true,
  portal_user_id      uuid references profiles(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create trigger trg_clients_updated before update on clients for each row execute function set_updated_at();

create table if not exists projects (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  client_id     uuid not null references clients(id) on delete cascade,
  site_location text,
  status        project_status not null default 'planning',
  start_date    date,
  end_date      date,
  budget        numeric(14,2),
  created_at    timestamptz not null default now()
);
create index if not exists idx_projects_client on projects(client_id);

-- ======================================================================
--  INSPECTIONS / JOBS
-- ======================================================================
create table if not exists inspections (
  id              uuid primary key default uuid_generate_v4(),
  ref             text unique not null,
  type            inspection_type not null,
  client_id       uuid references clients(id) on delete set null,
  project_id      uuid references projects(id) on delete set null,
  site_location   text not null,
  lat             double precision,
  lng             double precision,
  inspector_id    uuid references profiles(id) on delete set null,
  coordinator_id  uuid references profiles(id) on delete set null,
  scheduled_at    timestamptz not null,
  priority        priority_level not null default 'medium',
  status          job_status not null default 'pending',
  checklist       jsonb default '[]'::jsonb,
  photos          text[] default '{}',
  remarks         text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_inspections_status on inspections(status);
create index if not exists idx_inspections_inspector on inspections(inspector_id);
create index if not exists idx_inspections_client on inspections(client_id);
create index if not exists idx_inspections_scheduled on inspections(scheduled_at);
create trigger trg_inspections_updated before update on inspections for each row execute function set_updated_at();

-- ======================================================================
--  INSPECTION REPORTS
-- ======================================================================
create table if not exists reports (
  id             uuid primary key default uuid_generate_v4(),
  inspection_id  uuid not null references inspections(id) on delete cascade,
  status         report_status not null default 'draft',
  summary        text,
  pdf_url        text,
  submitted_by   uuid references profiles(id) on delete set null,
  submitted_at   timestamptz,
  reviewed_by    uuid references profiles(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists idx_reports_status on reports(status);
create trigger trg_reports_updated before update on reports for each row execute function set_updated_at();

-- ======================================================================
--  FIELD OPERATIONS — GPS movement logs
-- ======================================================================
create table if not exists field_logs (
  id             uuid primary key default uuid_generate_v4(),
  inspector_id   uuid not null references profiles(id) on delete cascade,
  inspection_id  uuid references inspections(id) on delete set null,
  event          text not null,          -- arrive | start | end | depart
  lat            double precision,
  lng            double precision,
  logged_at      timestamptz not null default now()
);
create index if not exists idx_field_logs_inspector on field_logs(inspector_id, logged_at);

-- ======================================================================
--  WORKFORCE — EMPLOYEES, ATTENDANCE, OVERTIME, PAYROLL
-- ======================================================================
create table if not exists employees (
  id               uuid primary key default uuid_generate_v4(),
  profile_id       uuid references profiles(id) on delete set null,
  employee_code    text unique not null,
  full_name        text not null,
  iqama_passport   text,
  position         text,
  department       text,
  basic_salary     numeric(12,2) not null default 0,
  ot_rate          numeric(8,2) not null default 0,   -- per hour
  phone            text,
  email            text,
  bank_iban        text,
  assigned_vehicle uuid,
  status           text not null default 'active',     -- active | on_leave | inactive
  join_date        date,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create trigger trg_employees_updated before update on employees for each row execute function set_updated_at();

create table if not exists attendance (
  id           uuid primary key default uuid_generate_v4(),
  employee_id  uuid not null references employees(id) on delete cascade,
  date         date not null,
  status       attendance_status not null default 'present',
  check_in     time,
  check_out    time,
  total_hours  numeric(5,2),
  late_minutes int default 0,
  lat          double precision,
  lng          double precision,
  created_at   timestamptz not null default now(),
  unique (employee_id, date)
);
create index if not exists idx_attendance_emp_date on attendance(employee_id, date);

create table if not exists overtime (
  id              uuid primary key default uuid_generate_v4(),
  employee_id     uuid not null references employees(id) on delete cascade,
  project_id      uuid references projects(id) on delete set null,
  date            date not null,
  start_time      time not null,
  end_time        time not null,
  total_hours     numeric(5,2) not null,
  standard_hours  numeric(5,2) not null default 8,
  ot_hours        numeric(5,2) generated always as (greatest(total_hours - standard_hours, 0)) stored,
  approval        approval_status not null default 'pending',
  approved_by     uuid references profiles(id) on delete set null,
  created_at      timestamptz not null default now()
);
create index if not exists idx_overtime_emp on overtime(employee_id);

create table if not exists payroll (
  id            uuid primary key default uuid_generate_v4(),
  employee_id   uuid not null references employees(id) on delete cascade,
  period        text not null,            -- 'YYYY-MM'
  basic_salary  numeric(12,2) not null default 0,
  ot_amount     numeric(12,2) not null default 0,
  allowances    numeric(12,2) not null default 0,
  deductions    numeric(12,2) not null default 0,
  net_salary    numeric(12,2) generated always as (basic_salary + ot_amount + allowances - deductions) stored,
  status        text not null default 'draft',  -- draft | approved | paid
  pdf_url       text,
  created_at    timestamptz not null default now(),
  unique (employee_id, period)
);
create index if not exists idx_payroll_period on payroll(period);

-- ======================================================================
--  FLEET — VEHICLES & FUEL
-- ======================================================================
create table if not exists vehicles (
  id                uuid primary key default uuid_generate_v4(),
  plate_number      text unique not null,
  make_model        text,
  assigned_employee uuid references employees(id) on delete set null,
  insurance_expiry  date,
  mileage           int,
  next_service_date date,
  status            text not null default 'active',  -- active | maintenance | inactive
  created_at        timestamptz not null default now()
);

create table if not exists fuel_expenses (
  id           uuid primary key default uuid_generate_v4(),
  vehicle_id   uuid references vehicles(id) on delete set null,
  employee_id  uuid references employees(id) on delete set null,
  project_id   uuid references projects(id) on delete set null,
  date         date not null,
  liters       numeric(8,2),
  amount       numeric(10,2) not null,
  receipt_url  text,
  approval     approval_status not null default 'pending',
  created_at   timestamptz not null default now()
);
create index if not exists idx_fuel_vehicle on fuel_expenses(vehicle_id);

create table if not exists vehicle_service (
  id           uuid primary key default uuid_generate_v4(),
  vehicle_id   uuid not null references vehicles(id) on delete cascade,
  service_date date not null,
  description  text,
  cost         numeric(10,2),
  created_at   timestamptz not null default now()
);

-- ======================================================================
--  SALES DOCS — QUOTATIONS & INVOICES
-- ======================================================================
create table if not exists quotations (
  id          uuid primary key default uuid_generate_v4(),
  number      text unique not null,
  client_id   uuid references clients(id) on delete set null,
  amount      numeric(14,2) not null default 0,
  status      text not null default 'draft',  -- draft | sent | accepted | rejected
  valid_until date,
  line_items  jsonb default '[]'::jsonb,
  pdf_url     text,
  created_at  timestamptz not null default now()
);

create table if not exists invoices (
  id          uuid primary key default uuid_generate_v4(),
  number      text unique not null,
  client_id   uuid references clients(id) on delete set null,
  amount      numeric(14,2) not null default 0,
  vat         numeric(14,2) not null default 0,
  total       numeric(14,2) generated always as (amount + vat) stored,
  status      text not null default 'draft',  -- draft | sent | paid | overdue
  due_date    date,
  pdf_url     text,
  created_at  timestamptz not null default now()
);

-- ======================================================================
--  EXPENSE CLAIMS, DOCUMENTS, NOTIFICATIONS
-- ======================================================================
create table if not exists expense_claims (
  id           uuid primary key default uuid_generate_v4(),
  employee_id  uuid references employees(id) on delete set null,
  project_id   uuid references projects(id) on delete set null,
  category     text,
  description  text,
  amount       numeric(10,2) not null,
  receipt_url  text,
  approval     approval_status not null default 'pending',
  created_at   timestamptz not null default now()
);

create table if not exists documents (
  id           uuid primary key default uuid_generate_v4(),
  owner_type   text,                     -- employee | client | inspection
  owner_id     uuid,
  name         text not null,
  file_url     text not null,
  expiry_date  date,
  created_at   timestamptz not null default now()
);

create table if not exists notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references profiles(id) on delete cascade,
  title       text not null,
  body        text,
  type        text not null default 'info',  -- info | success | warning | danger
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists idx_notifications_user on notifications(user_id, read);


-- =====================================================================
--  ROW LEVEL SECURITY POLICIES
--  Run after schema.sql.
-- =====================================================================

-- Helper: role of the current authenticated user.
create or replace function my_role()
returns user_role as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable security definer;

create or replace function is_staff()
returns boolean as $$
  select my_role() in ('super_admin','owner','admin','hr','coordinator','inspector');
$$ language sql stable security definer;

create or replace function is_management()
returns boolean as $$
  select my_role() in ('super_admin','owner','admin');
$$ language sql stable security definer;

-- Enable RLS everywhere
alter table profiles        enable row level security;
alter table leads           enable row level security;
alter table lead_activities enable row level security;
alter table clients         enable row level security;
alter table projects        enable row level security;
alter table inspections     enable row level security;
alter table reports         enable row level security;
alter table field_logs      enable row level security;
alter table employees       enable row level security;
alter table attendance      enable row level security;
alter table overtime        enable row level security;
alter table payroll         enable row level security;
alter table vehicles        enable row level security;
alter table fuel_expenses   enable row level security;
alter table vehicle_service enable row level security;
alter table quotations      enable row level security;
alter table invoices        enable row level security;
alter table expense_claims  enable row level security;
alter table documents       enable row level security;
alter table notifications   enable row level security;

-- ---------------------------------------------------------------- PROFILES
create policy "profiles self read"   on profiles for select using (id = auth.uid() or is_management());
create policy "profiles self update" on profiles for update using (id = auth.uid() or is_management());
create policy "profiles mgmt insert" on profiles for insert with check (is_management());

-- ---------------------------------------------------------------- LEADS (CRM staff only)
create policy "leads staff read"  on leads for select using (my_role() in ('super_admin','owner','admin','coordinator'));
create policy "leads staff write" on leads for all    using (my_role() in ('super_admin','owner','admin','coordinator')) with check (true);
create policy "lead_acts staff"   on lead_activities for all using (my_role() in ('super_admin','owner','admin','coordinator')) with check (true);

-- ---------------------------------------------------------------- CLIENTS & PROJECTS
create policy "clients staff read"  on clients for select using (is_staff() or portal_user_id = auth.uid());
create policy "clients mgmt write"  on clients for all using (my_role() in ('super_admin','owner','admin','coordinator')) with check (true);
create policy "projects staff read" on projects for select using (is_staff() or exists (select 1 from clients c where c.id = projects.client_id and c.portal_user_id = auth.uid()));
create policy "projects mgmt write" on projects for all using (my_role() in ('super_admin','owner','admin','coordinator')) with check (true);

-- ---------------------------------------------------------------- INSPECTIONS
-- Staff see all; inspectors see their own; clients see their company's.
create policy "inspections read" on inspections for select using (
  my_role() in ('super_admin','owner','admin','coordinator')
  or inspector_id = auth.uid()
  or exists (select 1 from clients c where c.id = inspections.client_id and c.portal_user_id = auth.uid())
);
create policy "inspections coord write"   on inspections for all using (my_role() in ('super_admin','owner','admin','coordinator')) with check (true);
create policy "inspections inspector edit" on inspections for update using (inspector_id = auth.uid());

-- ---------------------------------------------------------------- REPORTS
create policy "reports read" on reports for select using (
  my_role() in ('super_admin','owner','admin','coordinator')
  or submitted_by = auth.uid()
  or exists (
    select 1 from inspections i join clients c on c.id = i.client_id
    where i.id = reports.inspection_id and c.portal_user_id = auth.uid() and reports.status in ('sent_to_client','closed')
  )
);
create policy "reports staff write" on reports for all using (my_role() in ('super_admin','owner','admin','coordinator','inspector')) with check (true);

-- ---------------------------------------------------------------- FIELD LOGS
create policy "field read"  on field_logs for select using (my_role() in ('super_admin','owner','admin','coordinator') or inspector_id = auth.uid());
create policy "field write" on field_logs for insert with check (inspector_id = auth.uid() or my_role() in ('super_admin','owner','admin','coordinator'));

-- ---------------------------------------------------------------- WORKFORCE (HR + management)
create policy "employees hr"   on employees  for all using (my_role() in ('super_admin','owner','admin','hr')) with check (true);
create policy "employees self" on employees  for select using (profile_id = auth.uid());
create policy "attendance hr"  on attendance for all using (my_role() in ('super_admin','owner','admin','hr','coordinator')) with check (true);
create policy "overtime read"  on overtime   for select using (my_role() in ('super_admin','owner','admin','hr','coordinator'));
create policy "overtime write" on overtime   for all using (my_role() in ('super_admin','owner','admin','hr','coordinator')) with check (true);
create policy "payroll hr"     on payroll    for all using (my_role() in ('super_admin','owner','admin','hr')) with check (true);

-- ---------------------------------------------------------------- FLEET
create policy "vehicles read"  on vehicles      for select using (is_staff());
create policy "vehicles write" on vehicles      for all using (my_role() in ('super_admin','owner','admin','coordinator')) with check (true);
create policy "fuel read"      on fuel_expenses for select using (is_staff());
create policy "fuel write"     on fuel_expenses for all using (is_staff()) with check (true);
create policy "service all"    on vehicle_service for all using (my_role() in ('super_admin','owner','admin','coordinator')) with check (true);

-- ---------------------------------------------------------------- SALES DOCS
create policy "quotations staff" on quotations for all using (my_role() in ('super_admin','owner','admin','coordinator')) with check (true);
create policy "invoices read"    on invoices for select using (
  my_role() in ('super_admin','owner','admin')
  or exists (select 1 from clients c where c.id = invoices.client_id and c.portal_user_id = auth.uid())
);
create policy "invoices mgmt"    on invoices for all using (is_management()) with check (true);

-- ---------------------------------------------------------------- EXPENSES / DOCS / NOTIFICATIONS
create policy "expenses staff" on expense_claims for all using (is_staff()) with check (true);
create policy "documents staff" on documents for all using (is_staff()) with check (true);
create policy "notifications self" on notifications for all using (user_id = auth.uid()) with check (user_id = auth.uid());


-- =====================================================================
--  SEED DATA (demo) — run after schema.sql & policies.sql
--  Note: leads/clients/vehicles/employees have nullable owner FKs so they
--  seed without auth users. Create profiles via Supabase Auth sign-up,
--  then link inspector_id / owner_id as needed.
-- =====================================================================

insert into clients (company_name, industry, contact_person, email, phone, city, vat_number, payment_terms, outstanding_balance)
values
  ('Sadara Chemical','Chemical','Hassan Ali','h.ali@sadara-demo.com','+966555556677','Jubail','300012345600003','Net 30',125000),
  ('SABIC Jubail','Petrochemical','Khalid Al-Otaibi','k.otaibi@sabic-demo.com','+966551112233','Jubail','300011112200003','Net 45',0),
  ('Ma''aden Phosphate','Mining','Aisha Khan','a.khan@maaden-demo.com','+966553334455','Ras Al Khair','300033334400003','Net 30',48000)
on conflict do nothing;

insert into leads (company_name, industry, contact_person, position, email, phone, whatsapp, city, source, status, estimated_value, follow_up_date)
values
  ('SABIC Jubail','Petrochemical','Khalid Al-Otaibi','Procurement Manager','k.otaibi@sabic-demo.com','+966551112233','+966551112233','Jubail','referral','negotiation',480000,'2026-06-18'),
  ('Aramco Yanbu','Oil & Gas','Mohammed Saleh','Maintenance Lead','m.saleh@aramco-demo.com','+966552223344','+966552223344','Yanbu','exhibition','quotation_sent',220000,'2026-06-16'),
  ('Ma''aden Phosphate','Mining','Aisha Khan','QA/QC Head','a.khan@maaden-demo.com','+966553334455','+966553334455','Ras Al Khair','linkedin','interested',650000,'2026-06-20')
on conflict do nothing;

insert into employees (employee_code, full_name, iqama_passport, position, department, basic_salary, ot_rate, phone, status, join_date)
values
  ('EMP-001','Bilal Inspector','2412345678','Senior Inspector','Operations',6500,45,'+966500000006','active','2024-02-01'),
  ('EMP-002','Imran Coordinator','2498765432','Operations Coordinator','Operations',9000,60,'+966500000005','active','2023-09-15'),
  ('EMP-003','Ahmed NDT Tech','2411223344','NDT Technician','Operations',5800,40,'+966500000011','active','2024-06-10')
on conflict (employee_code) do nothing;

insert into vehicles (plate_number, make_model, insurance_expiry, mileage, next_service_date, status)
values
  ('JUB-4471','Toyota Hilux 2023','2026-11-01',84200,'2026-06-25','active'),
  ('JUB-2210','Nissan Patrol 2022','2026-08-15',121000,'2026-06-18','active'),
  ('JUB-9003','Toyota Land Cruiser 2021','2026-07-02',156400,'2026-07-05','maintenance')
on conflict (plate_number) do nothing;
