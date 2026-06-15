import { FileDown, Receipt } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddInvoice } from "@/components/invoices/add-invoice";
import { getClients, getInvoices } from "@/lib/data";
import { formatDate, formatSAR } from "@/lib/format";
import type { BadgeTone } from "@/lib/constants";

export const metadata = { title: "Invoices · Emerging ERP" };

const STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  draft: { label: "Draft", tone: "neutral" },
  sent: { label: "Sent", tone: "info" },
  paid: { label: "Paid", tone: "success" },
  overdue: { label: "Overdue", tone: "danger" },
};

export default async function InvoicesPage() {
  const [invoices, clients] = await Promise.all([getInvoices(), getClients()]);
  const outstanding = invoices.filter((i) => i.status !== "paid").reduce((s, i) => s + i.total, 0);
  const paid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" description="VAT invoices, payments and collections (15% KSA VAT).">
        <AddInvoice clients={clients.map((c) => ({ id: c.id, company_name: c.company_name }))} />
      </PageHeader>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Outstanding" value={formatSAR(outstanding, { compact: true })} icon={<Receipt />} />
        <StatCard label="Collected" value={formatSAR(paid, { compact: true })} icon={<Receipt />} accent />
        <StatCard label="Invoices" value={invoices.length} icon={<Receipt />} />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">VAT</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">PDF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.number}</TableCell>
                  <TableCell>{i.client_name}</TableCell>
                  <TableCell className="text-right text-sm">{formatSAR(i.amount, { compact: true })}</TableCell>
                  <TableCell className="text-right text-sm text-steel">{formatSAR(i.vat, { compact: true })}</TableCell>
                  <TableCell className="text-right font-medium">{formatSAR(i.total, { compact: true })}</TableCell>
                  <TableCell className="text-sm text-steel">{formatDate(i.due_date)}</TableCell>
                  <TableCell><Badge tone={STATUS[i.status].tone}>{STATUS[i.status].label}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <a href={`/api/pdf/invoice/${i.id}`} target="_blank" rel="noreferrer"><FileDown /> PDF</a>
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
