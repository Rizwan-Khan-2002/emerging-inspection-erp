import { Truck, Wrench } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { AddVehicle } from "@/components/vehicles/add-vehicle";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getVehicles } from "@/lib/data";
import { formatDate, formatNumber, relativeDays } from "@/lib/format";
import type { BadgeTone } from "@/lib/constants";

export const metadata = { title: "Vehicles · Emerging ERP" };

const STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  active: { label: "Active", tone: "success" },
  maintenance: { label: "Maintenance", tone: "warning" },
  inactive: { label: "Inactive", tone: "neutral" },
};

export default async function VehiclesPage() {
  const vehicles = await getVehicles();
  return (
    <div className="space-y-6">
      <PageHeader title="Vehicle Management" description="Fleet, insurance, mileage and service schedule.">
        <AddVehicle />
      </PageHeader>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Mileage</TableHead>
                <TableHead>Insurance Expiry</TableHead>
                <TableHead>Next Service</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((v) => {
                const days = relativeDays(v.next_service_date);
                const due = days != null && days <= 7;
                return (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-accent/10 text-accent"><Truck className="size-4" /></span>
                        <div>
                          <p className="font-medium">{v.plate_number}</p>
                          <p className="text-xs text-steel-dim">{v.make_model}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-steel">{v.assigned_employee ?? "—"}</TableCell>
                    <TableCell className="text-right text-sm">{v.mileage ? `${formatNumber(v.mileage)} km` : "—"}</TableCell>
                    <TableCell className="text-sm text-steel">{formatDate(v.insurance_expiry)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 text-sm ${due ? "text-warning" : "text-steel"}`}>
                        {due && <Wrench className="size-3.5" />} {formatDate(v.next_service_date)}
                      </span>
                    </TableCell>
                    <TableCell><Badge tone={STATUS[v.status].tone}>{STATUS[v.status].label}</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
