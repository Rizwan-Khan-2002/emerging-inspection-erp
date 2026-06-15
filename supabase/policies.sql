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
