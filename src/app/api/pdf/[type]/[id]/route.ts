import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoiceDoc, PayslipDoc, QuotationDoc, ReportDoc } from "@/lib/pdf/documents";
import {
  getInspectionById, getInvoiceById, getPayrollById, getQuotationById,
} from "@/lib/data";

export const runtime = "nodejs";

/**
 * GET /api/pdf/:type/:id  →  streams a generated PDF from REAL data
 * (Supabase when configured, else mock). type ∈ invoice | quotation | payslip | report
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params;

  let element: React.ReactElement | null = null;
  let filename = "document.pdf";

  switch (type) {
    case "invoice": {
      const inv = await getInvoiceById(id);
      if (inv) { element = createElement(InvoiceDoc, { inv }); filename = `${inv.number}.pdf`; }
      break;
    }
    case "quotation": {
      const q = await getQuotationById(id);
      if (q) { element = createElement(QuotationDoc, { q }); filename = `${q.number}.pdf`; }
      break;
    }
    case "payslip": {
      const p = await getPayrollById(id);
      if (p) { element = createElement(PayslipDoc, { p }); filename = `payslip-${p.employee_name.replace(/\s+/g, "-")}-${p.period}.pdf`; }
      break;
    }
    case "report": {
      const job = await getInspectionById(id);
      if (job) { element = createElement(ReportDoc, { job }); filename = `${job.ref}.pdf`; }
      break;
    }
  }

  if (!element) {
    return new Response("Document not found", { status: 404 });
  }

  const buffer = await renderToBuffer(element as Parameters<typeof renderToBuffer>[0]);
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
