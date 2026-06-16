import { PageHeader } from "@/components/common/page-header";
import { InspectionsBoard } from "@/components/inspections/inspections-board";
import { getClients, getInspections, getProjects } from "@/lib/data";

export const metadata = { title: "Inspections · Emerging ERP" };

export default async function InspectionsPage() {
  const [inspections, clients, projects] = await Promise.all([getInspections(), getClients(), getProjects()]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Inspection Jobs"
        description="Schedule, assign and track field inspections end-to-end."
      />
      <InspectionsBoard
        initial={inspections}
        clients={clients.map((c) => ({ id: c.id, company_name: c.company_name }))}
        projects={projects.map((p) => ({ id: p.id, name: p.name, client_id: p.client_id }))}
      />
    </div>
  );
}
