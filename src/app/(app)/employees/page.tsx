import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddEmployee } from "@/components/employees/add-employee";
import { ImportExport } from "@/components/common/import-export";
import { DeleteButton } from "@/components/common/delete-button";
import { importEmployees, deleteEmployee } from "@/lib/actions/entities";
import { getEmployees } from "@/lib/data";
import { formatSAR } from "@/lib/format";
import { initials } from "@/lib/utils";
import type { BadgeTone } from "@/lib/constants";

export const metadata = { title: "Employees · Emerging ERP" };

const STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  active: { label: "Active", tone: "success" },
  on_leave: { label: "On Leave", tone: "warning" },
  inactive: { label: "Inactive", tone: "neutral" },
};

export default async function EmployeesPage() {
  const employees = await getEmployees();
  const nextCode = `EMP-${String(employees.length + 1).padStart(3, "0")}`;
  return (
    <div className="space-y-6">
      <PageHeader title="Employees" description="Manpower records, salaries and assignments.">
        <ImportExport
          rows={employees.map((e) => ({
            employee_code: e.employee_code, full_name: e.full_name, iqama_passport: e.iqama_passport ?? "",
            position: e.position ?? "", department: e.department ?? "", basic_salary: e.basic_salary,
            ot_rate: e.ot_rate, phone: e.phone ?? "", email: e.email ?? "", status: e.status,
          }))}
          filename="employees"
          sheet="Employees"
          importAction={importEmployees}
        />
        <AddEmployee nextCode={nextCode} />
      </PageHeader>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Position</TableHead>
                <TableHead className="text-right">Basic Salary</TableHead>
                <TableHead className="text-right">OT Rate</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8"><AvatarFallback>{initials(e.full_name)}</AvatarFallback></Avatar>
                      <div>
                        <p className="font-medium">{e.full_name}</p>
                        <p className="text-xs text-steel-dim">{e.department}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-steel">{e.employee_code}</TableCell>
                  <TableCell className="text-sm">{e.position}</TableCell>
                  <TableCell className="text-right font-medium">{formatSAR(e.basic_salary)}</TableCell>
                  <TableCell className="text-right text-sm text-steel">{e.ot_rate ? `${e.ot_rate}/hr` : "—"}</TableCell>
                  <TableCell className="text-sm text-steel">{e.assigned_vehicle ?? "—"}</TableCell>
                  <TableCell><Badge tone={STATUS[e.status].tone}>{STATUS[e.status].label}</Badge></TableCell>
                  <TableCell className="text-right">
                    <DeleteButton
                      action={deleteEmployee.bind(null, e.id)}
                      name={e.full_name}
                      note={`This permanently removes ${e.full_name} along with their payroll, attendance, overtime, fuel and expense records.`}
                    />
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
