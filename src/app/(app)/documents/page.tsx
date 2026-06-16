import { FileText, Download, Files, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DocumentUpload, DeleteDocButton } from "@/components/documents/document-upload";
import { getDocuments } from "@/lib/data";
import { formatDate } from "@/lib/format";
import type { BadgeTone } from "@/lib/constants";

export const metadata = { title: "Documents · Emerging ERP" };

/** Days until expiry → status badge. */
function expiryStatus(expiry?: string | null): { label: string; tone: BadgeTone; urgent: boolean } | null {
  if (!expiry) return null;
  const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { label: `Expired ${Math.abs(days)}d ago`, tone: "danger", urgent: true };
  if (days <= 30) return { label: `Expires in ${days}d`, tone: "warning", urgent: true };
  return { label: "Valid", tone: "success", urgent: false };
}

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const docs = await getDocuments();
  const withStatus = docs.map((d) => ({ ...d, status: expiryStatus(d.expiry_date) }));
  const expired = withStatus.filter((d) => d.status?.tone === "danger").length;
  const expiringSoon = withStatus.filter((d) => d.status?.tone === "warning").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Document Management" description="Certificates, contracts and compliance documents.">
        <DocumentUpload />
      </PageHeader>

      {(expired > 0 || expiringSoon > 0) && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
          <AlertTriangle className="size-4 shrink-0 text-warning" />
          <span className="font-medium text-warning">Compliance alert:</span>
          {expired > 0 && <span><strong className="text-danger">{expired}</strong> document{expired > 1 ? "s" : ""} expired</span>}
          {expired > 0 && expiringSoon > 0 && <span className="text-steel-dim">·</span>}
          {expiringSoon > 0 && <span><strong>{expiringSoon}</strong> expiring within 30 days</span>}
          <span className="text-steel-dim">— renew before they lapse.</span>
        </div>
      )}

      {docs.length === 0 ? (
        <EmptyState
          icon={<Files />}
          title="No documents yet"
          description="Upload certificates, contracts or compliance files (PDF, images, Word, Excel — up to 10MB)."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withStatus.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <span className="flex items-center gap-2 font-medium">
                        <FileText className="size-4 text-accent" /> {d.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-steel">{d.expiry_date ? formatDate(d.expiry_date) : "—"}</TableCell>
                    <TableCell>{d.status ? <Badge tone={d.status.tone}>{d.status.label}</Badge> : <span className="text-sm text-steel-dim">—</span>}</TableCell>
                    <TableCell className="text-sm text-steel">{formatDate(d.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <a href={d.file_url} target="_blank" rel="noreferrer"><Download /> Open</a>
                        </Button>
                        <DeleteDocButton id={d.id} />
                      </div>
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
