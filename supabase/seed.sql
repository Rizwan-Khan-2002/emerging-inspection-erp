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
