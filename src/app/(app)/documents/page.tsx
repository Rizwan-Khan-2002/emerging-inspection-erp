import { FileText, Download, Files } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DocumentUpload, DeleteDocButton } from "@/components/documents/document-upload";
import { getDocuments } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Documents · Emerging ERP" };

export default async function DocumentsPage() {
  const docs = await getDocuments();

  return (
    <div className="space-y-6">
      <PageHeader title="Document Management" description="Certificates, contracts and compliance documents.">
        <DocumentUpload />
      </PageHeader>

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
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {docs.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <span className="flex items-center gap-2 font-medium">
                        <FileText className="size-4 text-accent" /> {d.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-steel">{d.expiry_date ? formatDate(d.expiry_date) : "—"}</TableCell>
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
