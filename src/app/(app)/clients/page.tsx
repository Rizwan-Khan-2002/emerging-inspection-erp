import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { AddClient } from "@/components/clients/add-client";
import { ImportExport } from "@/components/common/import-export";
import { DeleteButton } from "@/components/common/delete-button";
import { importClients, deleteRecord } from "@/lib/actions/entities";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getClients } from "@/lib/data";
import { formatSAR } from "@/lib/format";

export const metadata = { title: "Clients · Emerging ERP" };

export default async function ClientsPage() {
  const clients = await getClients();
  return (
    <div className="space-y-6">
      <PageHeader title="Clients" description="Active client accounts, contracts and balances.">
        <ImportExport
          rows={clients.map((c) => ({
            company_name: c.company_name, industry: c.industry ?? "", contact_person: c.contact_person ?? "",
            email: c.email ?? "", phone: c.phone ?? "", city: c.city ?? "", country: c.country,
            vat_number: c.vat_number ?? "", payment_terms: c.payment_terms ?? "",
          }))}
          filename="clients"
          sheet="Clients"
          importAction={importClients}
        />
        <AddClient />
      </PageHeader>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Terms</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-accent/10 text-accent"><Building2 className="size-4" /></span>
                      <div>
                        <p className="font-medium">{c.company_name}</p>
                        <p className="text-xs text-steel-dim">{c.industry}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{c.contact_person}</p>
                    <p className="text-xs text-steel-dim">{c.email}</p>
                  </TableCell>
                  <TableCell className="text-sm text-steel">{c.city}, {c.country}</TableCell>
                  <TableCell className="text-sm text-steel">{c.payment_terms}</TableCell>
                  <TableCell className="text-right font-medium">
                    <span className={c.outstanding_balance > 0 ? "text-warning" : "text-success"}>
                      {formatSAR(c.outstanding_balance, { compact: true })}
                    </span>
                  </TableCell>
                  <TableCell><Badge tone={c.active ? "success" : "neutral"}>{c.active ? "Active" : "Inactive"}</Badge></TableCell>
                  <TableCell className="text-right">
                    <DeleteButton
                      action={deleteRecord.bind(null, "clients", c.id, "/clients")}
                      name={c.company_name}
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
