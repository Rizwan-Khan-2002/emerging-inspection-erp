import { PageHeader } from "@/components/common/page-header";
import { InspectionsBoard } from "@/components/inspections/inspections-board";
import { getClients, getInspections } from "@/lib/data";

export const metadata = { title: "Inspections · Emerging ERP" };

export default async function InspectionsPage() {
  const [inspections, clients] = await Promise.all([getInspections(), getClients()]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Inspection Jobs"
        description="Schedule, assign and track field inspections end-to-end."
      />
      <InspectionsBoard
        initial={inspections}
        clients={clients.map((c) => ({ id: c.id, company_name: c.company_name }))}
      />
    </div>
  );
}
