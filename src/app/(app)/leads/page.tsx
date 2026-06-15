import { Download } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { LeadsBoard } from "@/components/leads/leads-board";
import { getLeads } from "@/lib/data";

export const metadata = { title: "Leads CRM · Emerging ERP" };

export default async function LeadsPage() {
  const leads = await getLeads();
  return (
    <div className="space-y-6">
      <PageHeader title="Leads CRM" description="Track and convert your sales pipeline.">
        <Button variant="secondary"><Download /> Export</Button>
      </PageHeader>
      <LeadsBoard initialLeads={leads} />
    </div>
  );
}
