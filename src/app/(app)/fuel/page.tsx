import { Droplet, Fuel } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApprovalButtons } from "@/components/common/approval-buttons";
import { AddFuel } from "@/components/fuel/add-fuel";
import { getEmployees, getFuel, getVehicles } from "@/lib/data";
import { formatSAR } from "@/lib/format";
import type { BadgeTone } from "@/lib/constants";

export const metadata = { title: "Fuel Expenses · Emerging ERP" };

const APPROVAL: Record<string, { label: string; tone: BadgeTone }> = {
  pending: { label: "Pending", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
};

export default async function FuelPage() {
  const [fuel, vehicles, employees] = await Promise.all([getFuel(), getVehicles(), getEmployees()]);
  const total = fuel.reduce((s, f) => s + f.amount, 0);
  const liters = fuel.reduce((s, f) => s + f.liters, 0);
  const pending = fuel.filter((f) => f.approval === "pending").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Fuel Expenses" description="Fuel claims, receipts and project-linked usage.">
        <AddFuel
          vehicles={vehicles.map((v) => ({ id: v.id, plate_number: v.plate_number }))}
          employees={employees.map((e) => ({ id: e.id, full_name: e.full_name }))}
        />
      </PageHeader>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total (week)" value={formatSAR(total)} icon={<Droplet />} accent />
        <StatCard label="Litres" value={liters} icon={<Fuel />} />
        <StatCard label="Pending" value={pending} icon={<Fuel />} />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Litres</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fuel.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.vehicle_plate}</TableCell>
                  <TableCell className="text-sm text-steel">{f.employee_name}</TableCell>
                  <TableCell className="text-sm text-steel">{f.project_name ?? "—"}</TableCell>
                  <TableCell className="text-sm text-steel">{f.date}</TableCell>
                  <TableCell className="text-right text-sm">{f.liters} L</TableCell>
                  <TableCell className="text-right font-medium">{formatSAR(f.amount)}</TableCell>
                  <TableCell><Badge tone={APPROVAL[f.approval].tone}>{APPROVAL[f.approval].label}</Badge></TableCell>
                  <TableCell className="text-right">
                    {f.approval === "pending" && <ApprovalButtons table="fuel_expenses" id={f.id} />}
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
