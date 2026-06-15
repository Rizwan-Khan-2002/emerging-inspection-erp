import { FileDown, FileText } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddQuotation } from "@/components/quotations/add-quotation";
import { getClients, getQuotations } from "@/lib/data";
import { formatDate, formatSAR } from "@/lib/format";
import type { BadgeTone } from "@/lib/constants";

export const metadata = { title: "Quotations · Emerging ERP" };

const STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  draft: { label: "Draft", tone: "neutral" },
  sent: { label: "Sent", tone: "info" },
  accepted: { label: "Accepted", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
};

export default async function QuotationsPage() {
  const [quotations, clients] = await Promise.all([getQuotations(), getClients()]);
  return (
    <div className="space-y-6">
      <PageHeader title="Quotations" description="Generate, send and track client quotations.">
        <AddQuotation clients={clients.map((c) => ({ id: c.id, company_name: c.company_name }))} />
      </PageHeader>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">PDF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.map((q) => (
                <TableRow key={q.id}>
                  <TableCell>
                    <span className="flex items-center gap-2 font-medium">
                      <FileText className="size-4 text-accent" /> {q.number}
                    </span>
                  </TableCell>
                  <TableCell>{q.client_name}</TableCell>
                  <TableCell className="text-right font-medium">{formatSAR(q.amount, { compact: true })}</TableCell>
                  <TableCell className="text-sm text-steel">{formatDate(q.valid_until)}</TableCell>
                  <TableCell><Badge tone={STATUS[q.status].tone}>{STATUS[q.status].label}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <a href={`/api/pdf/quotation/${q.id}`} target="_blank" rel="noreferrer"><FileDown /> PDF</a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
