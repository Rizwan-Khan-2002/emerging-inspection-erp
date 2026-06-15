import { Document, Page, Text, View } from "@react-pdf/renderer";
import { PDF, styles as s } from "./styles";
import { INSPECTION_TYPE } from "@/lib/constants";
import type {
  ChecklistItem, Inspection, Invoice, PayrollRecord, Quotation,
} from "@/lib/types";

const COMPANY = {
  name: "EMERGING INSPECTION",
  legal: "Emerging Inspection & Technical Services Co.",
  address: "Jubail Industrial City, Eastern Province, Saudi Arabia",
  vat: "VAT 300000000000003",
  email: "ops@emerginginspection.com",
  phone: "+966 13 000 0000",
};

function money(n: number) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + " SAR";
}
function dt(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function Header({ docType, ref, date }: { docType: string; ref: string; date: string }) {
  return (
    <View style={s.header}>
      <View style={s.brandRow}>
        <View style={s.logoBox}><Text style={s.logoText}>E</Text></View>
        <View>
          <Text style={s.brandName}>{COMPANY.name}</Text>
          <Text style={s.brandSub}>INSPECTION ERP</Text>
        </View>
      </View>
      <View>
        <Text style={s.docType}>{docType}</Text>
        <Text style={s.docMeta}>{ref}</Text>
        <Text style={s.docMeta}>{date}</Text>
      </View>
    </View>
  );
}

function Footer() {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>{COMPANY.legal} · {COMPANY.vat}</Text>
      <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function CompanyClient({ clientName, clientMeta }: { clientName: string; clientMeta?: string[] }) {
  return (
    <View style={s.metaRow}>
      <View style={s.metaCol}>
        <Text style={s.metaLabel}>From</Text>
        <Text style={s.metaValue}>{COMPANY.legal}</Text>
        <Text style={s.metaText}>{COMPANY.address}</Text>
        <Text style={s.metaText}>{COMPANY.email}</Text>
        <Text style={s.metaText}>{COMPANY.phone}</Text>
      </View>
      <View style={s.metaCol}>
        <Text style={s.metaLabel}>To</Text>
        <Text style={s.metaValue}>{clientName}</Text>
        {clientMeta?.map((m, i) => <Text key={i} style={s.metaText}>{m}</Text>)}
      </View>
    </View>
  );
}

/* ------------------------------- INVOICE ---------------------------------- */
export function InvoiceDoc({ inv }: { inv: Invoice }) {
  const lines = [
    { desc: "Industrial inspection services — as per agreement", qty: 1, rate: inv.amount },
  ];
  return (
    <Document title={inv.number}>
      <Page size="A4" style={s.page}>
        <Header docType="INVOICE" ref={inv.number} date={dt(inv.created_at)} />
        <View style={s.body}>
          <CompanyClient clientName={inv.client_name} clientMeta={[`Due: ${dt(inv.due_date)}`, `Status: ${inv.status.toUpperCase()}`]} />
          <Text style={s.sectionTitle}>Line Items</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.tHeadCell, { width: "60%" }]}>Description</Text>
              <Text style={[s.tHeadCell, { width: "12%", textAlign: "right" }]}>Qty</Text>
              <Text style={[s.tHeadCell, { width: "28%", textAlign: "right" }]}>Amount</Text>
            </View>
            {lines.map((l, i) => (
              <View key={i} style={[s.tRow, ...(i % 2 ? [s.tRowAlt] : [])]}>
                <Text style={[s.tCell, { width: "60%" }]}>{l.desc}</Text>
                <Text style={[s.tCell, { width: "12%", textAlign: "right" }]}>{l.qty}</Text>
                <Text style={[s.tCell, { width: "28%", textAlign: "right" }]}>{money(l.rate)}</Text>
              </View>
            ))}
          </View>
          <View style={s.totals}>
            <View style={s.totalRow}><Text style={s.totalLabel}>Subtotal</Text><Text style={s.totalValue}>{money(inv.amount)}</Text></View>
            <View style={s.totalRow}><Text style={s.totalLabel}>VAT (15%)</Text><Text style={s.totalValue}>{money(inv.vat)}</Text></View>
            <View style={s.grandRow}><Text style={s.grandLabel}>TOTAL</Text><Text style={s.grandValue}>{money(inv.total)}</Text></View>
          </View>
          <Text style={s.note}>Payment due by {dt(inv.due_date)}. Bank transfer to Emerging Inspection & Technical Services Co. Please quote invoice number {inv.number} as reference.</Text>
        </View>
        <Footer />
      </Page>
    </Document>
  );
}

/* ----------------------------- QUOTATION ---------------------------------- */
export function QuotationDoc({ q }: { q: Quotation }) {
  const vat = q.amount * 0.15;
  return (
    <Document title={q.number}>
      <Page size="A4" style={s.page}>
        <Header docType="QUOTATION" ref={q.number} date={dt(q.created_at)} />
        <View style={s.body}>
          <CompanyClient clientName={q.client_name} clientMeta={[`Valid until: ${dt(q.valid_until)}`]} />
          <Text style={s.sectionTitle}>Scope of Work</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={[s.tHeadCell, { width: "72%" }]}>Service</Text>
              <Text style={[s.tHeadCell, { width: "28%", textAlign: "right" }]}>Amount</Text>
            </View>
            <View style={s.tRow}>
              <Text style={[s.tCell, { width: "72%" }]}>Industrial inspection scope — scaffolding / NDT / QA-QC as agreed, certified inspectors, equipment & reporting.</Text>
              <Text style={[s.tCell, { width: "28%", textAlign: "right" }]}>{money(q.amount)}</Text>
            </View>
          </View>
          <View style={s.totals}>
            <View style={s.totalRow}><Text style={s.totalLabel}>Subtotal</Text><Text style={s.totalValue}>{money(q.amount)}</Text></View>
            <View style={s.totalRow}><Text style={s.totalLabel}>VAT (15%)</Text><Text style={s.totalValue}>{money(vat)}</Text></View>
            <View style={s.grandRow}><Text style={s.grandLabel}>TOTAL</Text><Text style={s.grandValue}>{money(q.amount + vat)}</Text></View>
          </View>
          <Text style={s.note}>This quotation is valid until {dt(q.valid_until)}. Prices in SAR, exclusive of mobilisation unless stated. Acceptance via signed PO.</Text>
          <View style={s.signRow}>
            <View style={s.signBox}><Text style={s.metaText}>For Emerging Inspection</Text></View>
            <View style={s.signBox}><Text style={s.metaText}>Client Acceptance</Text></View>
          </View>
        </View>
        <Footer />
      </Page>
    </Document>
  );
}

/* ------------------------------- PAYSLIP ---------------------------------- */
export function PayslipDoc({ p }: { p: PayrollRecord }) {
  const earnings = [
    { label: "Basic Salary", value: p.basic_salary },
    { label: "Overtime", value: p.ot_amount },
    { label: "Allowances", value: p.allowances },
  ];
  const gross = p.basic_salary + p.ot_amount + p.allowances;
  return (
    <Document title={`Payslip ${p.employee_name} ${p.period}`}>
      <Page size="A4" style={s.page}>
        <Header docType="PAYSLIP" ref={`Period ${p.period}`} date={p.period} />
        <View style={s.body}>
          <View style={s.metaRow}>
            <View style={s.metaCol}>
              <Text style={s.metaLabel}>Employee</Text>
              <Text style={s.metaValue}>{p.employee_name}</Text>
              <Text style={s.metaText}>Pay period: {p.period}</Text>
            </View>
            <View style={s.metaCol}>
              <Text style={s.metaLabel}>Status</Text>
              <Text style={s.badge}>{p.status.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={s.sectionTitle}>Earnings</Text>
          <View style={s.table}>
            {earnings.map((e, i) => (
              <View key={i} style={[s.tRow, ...(i % 2 ? [s.tRowAlt] : [])]}>
                <Text style={[s.tCell, { width: "70%" }]}>{e.label}</Text>
                <Text style={[s.tCell, { width: "30%", textAlign: "right" }]}>{money(e.value)}</Text>
              </View>
            ))}
            <View style={s.tRow}>
              <Text style={[s.tCell, { width: "70%", fontFamily: "Helvetica-Bold" }]}>Gross</Text>
              <Text style={[s.tCell, { width: "30%", textAlign: "right", fontFamily: "Helvetica-Bold" }]}>{money(gross)}</Text>
            </View>
          </View>

          <Text style={s.sectionTitle}>Deductions</Text>
          <View style={s.table}>
            <View style={s.tRow}>
              <Text style={[s.tCell, { width: "70%" }]}>Total Deductions</Text>
              <Text style={[s.tCell, { width: "30%", textAlign: "right" }]}>− {money(p.deductions)}</Text>
            </View>
          </View>

          <View style={s.totals}>
            <View style={s.grandRow}><Text style={s.grandLabel}>NET PAY</Text><Text style={s.grandValue}>{money(p.net_salary)}</Text></View>
          </View>
          <Text style={s.note}>Net = Basic + Overtime + Allowances − Deductions. This is a computer-generated payslip.</Text>
        </View>
        <Footer />
      </Page>
    </Document>
  );
}

/* --------------------------- INSPECTION REPORT ---------------------------- */
export function ReportDoc({ job }: { job: Inspection }) {
  const checklist: ChecklistItem[] = job.checklist ?? [];
  const resultColor: Record<string, string> = { pass: "#2e9e63", fail: "#d23a52", na: PDF.steel, pending: PDF.accent };
  return (
    <Document title={job.ref}>
      <Page size="A4" style={s.page}>
        <Header docType="INSPECTION REPORT" ref={job.ref} date={dt(job.scheduled_at)} />
        <View style={s.body}>
          <View style={s.metaRow}>
            <View style={s.metaCol}>
              <Text style={s.metaLabel}>Client</Text>
              <Text style={s.metaValue}>{job.client_name}</Text>
              <Text style={s.metaText}>{job.site_location}</Text>
              {job.project_name ? <Text style={s.metaText}>Project: {job.project_name}</Text> : null}
            </View>
            <View style={s.metaCol}>
              <Text style={s.metaLabel}>Inspection</Text>
              <Text style={s.metaValue}>{INSPECTION_TYPE[job.type]}</Text>
              <Text style={s.metaText}>Inspector: {job.inspector_name ?? "—"}</Text>
              <Text style={s.metaText}>Priority: {job.priority.toUpperCase()}</Text>
              {job.lat != null ? <Text style={s.metaText}>GPS: {job.lat}, {job.lng}</Text> : null}
            </View>
          </View>

          <Text style={s.sectionTitle}>Inspection Checklist</Text>
          {checklist.length === 0 ? (
            <Text style={s.metaText}>No checklist items recorded.</Text>
          ) : (
            <View style={s.table}>
              {checklist.map((c, i) => (
                <View key={c.id} style={[s.tRow, ...(i % 2 ? [s.tRowAlt] : [])]}>
                  <Text style={[s.tCell, { width: "70%" }]}>{c.label}{c.note ? ` — ${c.note}` : ""}</Text>
                  <Text style={[s.tCell, { width: "30%", textAlign: "right", fontFamily: "Helvetica-Bold", color: resultColor[c.result] }]}>
                    {c.result.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <Text style={s.sectionTitle}>Remarks</Text>
          <Text style={s.metaText}>{job.remarks ?? "No remarks."}</Text>

          <View style={s.signRow}>
            <View style={s.signBox}><Text style={s.metaText}>Inspector Signature</Text></View>
            <View style={s.signBox}><Text style={s.metaText}>Coordinator Approval</Text></View>
          </View>
        </View>
        <Footer />
      </Page>
    </Document>
  );
}
