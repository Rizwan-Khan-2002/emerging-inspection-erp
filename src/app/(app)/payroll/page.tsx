import { FileDown, Wallet } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddPayroll } from "@/components/payroll/add-payroll";
import { getEmployees, getPayroll } from "@/lib/data";
import { formatSAR } from "@/lib/format";
import type { BadgeTone } from "@/lib/constants";

export const metadata = { title: "Payroll · Emerging ERP" };

const STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  draft: { label: "Draft", tone: "neutral" },
  approved: { label: "Approved", tone: "info" },
  paid: { label: "Paid", tone: "success" },
};

export default async function PayrollPage() {
  const [payroll, employees] = await Promise.all([getPayroll(), getEmployees()]);
  const period = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  const total = payroll.reduce((s, p) => s + p.net_salary, 0);
  const ot = payroll.reduce((s, p) => s + p.ot_amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Payroll" description={`${period} · Basic + OT + Allowances − Deductions = Net.`}>
        <AddPayroll employees={employees.map((e) => ({
          id: e.id, full_name: e.full_name, basic_salary: e.basic_salary,
          allowances: (e.allow_food ?? 0) + (e.allow_accommodation ?? 0) + (e.allow_telephone ?? 0) + (e.allow_carwash ?? 0),
          deductions: (e.deduct_fuel ?? 0) + (e.deduct_car_emi ?? 0),
        }))} />
      </PageHeader>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Net Payroll" value={formatSAR(total, { compact: true })} icon={<Wallet />} accent />
        <StatCard label="Total OT Paid" value={formatSAR(ot, { compact: true })} icon={<Wallet />} />
        <StatCard label="Employees" value={payroll.length} icon={<Wallet />} />
        <StatCard label="Paid" value={payroll.filter((p) => p.status === "paid").length} icon={<Wallet />} />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead className="text-right">Basic</TableHead>
                <TableHead className="text-right">OT</TableHead>
                <TableHead className="text-right">Allowances</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Payslip</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payroll.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.employee_name}</TableCell>
                  <TableCell className="text-right text-sm">{formatSAR(p.basic_salary)}</TableCell>
                  <TableCell className="text-right text-sm text-accent">{formatSAR(p.ot_amount)}</TableCell>
                  <TableCell className="text-right text-sm">{formatSAR(p.allowances)}</TableCell>
                  <TableCell className="text-right text-sm text-danger">−{formatSAR(p.deductions)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatSAR(p.net_salary)}</TableCell>
                  <TableCell><Badge tone={STATUS[p.status].tone}>{STATUS[p.status].label}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <a href={`/api/pdf/payslip/${p.id}`} target="_blank" rel="noreferrer"><FileDown /> PDF</a>
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
