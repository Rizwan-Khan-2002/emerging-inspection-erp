import { FileDown } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { INSPECTION_TYPE, REPORT_STATUS } from "@/lib/constants";
import { EmptyState } from "@/components/common/empty-state";
import { FileCheck2 } from "lucide-react";
import { getReports } from "@/lib/data";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Reports · Emerging ERP" };

export default async function ReportsPage() {
  const reports = await getReports();
  return (
    <div className="space-y-6">
      <PageHeader title="Inspection Reports" description="Review, approve and deliver reports to clients." />
      {reports.length === 0 ? (
        <EmptyState icon={<FileCheck2 />} title="No reports yet" description="Reports appear here once inspectors submit them from completed inspections." />
      ) : (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Inspection Ref</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Inspector</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.inspection_ref}</TableCell>
                  <TableCell>{r.client_name}</TableCell>
                  <TableCell className="text-sm text-steel">{INSPECTION_TYPE[r.type]}</TableCell>
                  <TableCell className="text-sm text-steel">{r.inspector_name}</TableCell>
                  <TableCell className="text-sm text-steel">{formatDateTime(r.submitted_at)}</TableCell>
                  <TableCell><StatusBadge status={REPORT_STATUS[r.status]} /></TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <a href={`/api/pdf/report/${r.inspection_ref}`} target="_blank" rel="noreferrer"><FileDown /> PDF</a>
                    </Button>
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
