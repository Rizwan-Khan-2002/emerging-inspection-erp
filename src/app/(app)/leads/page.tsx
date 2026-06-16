import { PageHeader } from "@/components/common/page-header";
import { LeadsBoard } from "@/components/leads/leads-board";
import { getLeads } from "@/lib/data";

export const metadata = { title: "Leads CRM · Emerging ERP" };

export default async function LeadsPage() {
  const leads = await getLeads();
  return (
    <div className="space-y-6">
      <PageHeader title="Leads CRM" description="Track and convert your sales pipeline. Import / export via Excel." />
      <LeadsBoard initialLeads={leads} />
    </div>
  );
}
