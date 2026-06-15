import { Check, Clock } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApprovalButtons } from "@/components/common/approval-buttons";
import { AddOvertime } from "@/components/overtime/add-overtime";
import { getEmployees, getOvertime } from "@/lib/data";
import { STANDARD_DUTY_HOURS } from "@/lib/constants";
import type { BadgeTone } from "@/lib/constants";

export const metadata = { title: "Overtime · Emerging ERP" };

const APPROVAL: Record<string, { label: string; tone: BadgeTone }> = {
  pending: { label: "Pending", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
};

export default async function OvertimePage() {
  const [overtime, employees] = await Promise.all([getOvertime(), getEmployees()]);
  const totalOt = overtime.reduce((s, o) => s + o.ot_hours, 0);
  const pending = overtime.filter((o) => o.approval === "pending").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overtime Tracking"
        description={`Auto-calculated: Total Hours − ${STANDARD_DUTY_HOURS}h standard = OT hours.`}
      >
        <AddOvertime employees={employees.map((e) => ({ id: e.id, full_name: e.full_name }))} />
      </PageHeader>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total OT Hours" value={totalOt} icon={<Clock />} accent />
        <StatCard label="Pending Approval" value={pending} icon={<Clock />} />
        <StatCard label="Approved" value={overtime.length - pending} icon={<Check />} />
        <StatCard label="Records" value={overtime.length} icon={<Clock />} />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">OT</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overtime.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.employee_name}</TableCell>
                  <TableCell className="text-sm text-steel">{o.date}</TableCell>
                  <TableCell className="text-sm text-steel">{o.project_name ?? "—"}</TableCell>
                  <TableCell className="text-sm text-steel">{o.start_time}–{o.end_time}</TableCell>
                  <TableCell className="text-right">{o.total_hours}h</TableCell>
                  <TableCell className="text-right font-semibold text-accent">{o.ot_hours}h</TableCell>
                  <TableCell><Badge tone={APPROVAL[o.approval].tone}>{APPROVAL[o.approval].label}</Badge></TableCell>
                  <TableCell className="text-right">
                    {o.approval === "pending" ? (
                      <ApprovalButtons table="overtime" id={o.id} />
                    ) : (
                      <span className="text-xs text-steel-dim">{o.approved_by}</span>
                    )}
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
