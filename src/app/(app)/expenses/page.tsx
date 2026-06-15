import { ReceiptText } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApprovalButtons } from "@/components/common/approval-buttons";
import { AddExpense } from "@/components/expenses/add-expense";
import { getEmployees, getExpenses } from "@/lib/data";
import { formatSAR } from "@/lib/format";
import type { BadgeTone } from "@/lib/constants";

export const metadata = { title: "Expense Claims · Emerging ERP" };

const APPROVAL: Record<string, { label: string; tone: BadgeTone }> = {
  pending: { label: "Pending", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
};

export default async function ExpensesPage() {
  const [expenses, employees] = await Promise.all([getExpenses(), getEmployees()]);
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const pending = expenses.filter((e) => e.approval === "pending").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Expense Claims" description="Employee expense submissions and approvals.">
        <AddExpense employees={employees.map((e) => ({ id: e.id, full_name: e.full_name }))} />
      </PageHeader>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Claims" value={formatSAR(total, { compact: true })} icon={<ReceiptText />} accent />
        <StatCard label="Pending" value={pending} icon={<ReceiptText />} />
        <StatCard label="Records" value={expenses.length} icon={<ReceiptText />} />
      </div>

      {expenses.length === 0 ? (
        <EmptyState icon={<ReceiptText />} title="No expense claims yet" description="Submit the first expense claim with the button above." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.employee_name}</TableCell>
                    <TableCell className="text-sm text-steel">{e.category}</TableCell>
                    <TableCell className="text-sm text-steel">{e.description ?? "—"}</TableCell>
                    <TableCell className="text-right font-medium">{formatSAR(e.amount)}</TableCell>
                    <TableCell><Badge tone={APPROVAL[e.approval].tone}>{APPROVAL[e.approval].label}</Badge></TableCell>
                    <TableCell className="text-right">
                      {e.approval === "pending" && <ApprovalButtons table="expense_claims" id={e.id} />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
