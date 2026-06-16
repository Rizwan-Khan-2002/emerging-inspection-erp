import { FileDown, FileCheck2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReportActions } from "@/components/reports/report-actions";
import { INSPECTION_TYPE, REPORT_STATUS } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import { getReports } from "@/lib/data";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Reports · Emerging ERP" };

export default async function ReportsPage() {
  const [reports, me] = await Promise.all([getReports(), getCurrentUser()]);
  const role = me?.role ?? "client";
  const canManage = ["super_admin", "owner", "admin", "coordinator"].includes(role);
  const isClient = role === "client";

  return (
    <div className="space-y-6">
      <PageHeader
        title={isClient ? "My Reports" : "Inspection Reports"}
        description={isClient
          ? "Inspection reports shared with you — view and download."
          : "Review, approve and deliver reports to clients."}
      />
      {reports.length === 0 ? (
        <EmptyState
          icon={<FileCheck2 />}
          title="No reports yet"
          description={isClient
            ? "Reports shared with you will appear here."
            : "Reports appear here once inspectors submit them from inspections (Inspections → open a job → Submit Report)."}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inspection Ref</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">PDF</TableHead>
                  {canManage && <TableHead className="text-right">Workflow</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.inspection_ref}</TableCell>
                    <TableCell>{r.client_name}</TableCell>
                    <TableCell className="text-sm text-steel">{INSPECTION_TYPE[r.type]}</TableCell>
                    <TableCell className="text-sm text-steel">{formatDateTime(r.submitted_at)}</TableCell>
                    <TableCell><StatusBadge status={REPORT_STATUS[r.status]} /></TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <a href={`/api/pdf/report/${r.inspection_ref}`} target="_blank" rel="noreferrer"><FileDown /> PDF</a>
                      </Button>
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <ReportActions reportId={r.id} status={r.status} canManage={canManage} />
                      </TableCell>
                    )}
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
