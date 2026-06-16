import Link from "next/link";
import { ClipboardCheck, FolderKanban } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { AddProject } from "@/components/projects/add-project";
import { getClients, getInspections, getProjects } from "@/lib/data";
import { formatDate, formatSAR } from "@/lib/format";
import type { BadgeTone } from "@/lib/constants";

export const metadata = { title: "Projects · Emerging ERP" };

const STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  planning: { label: "Planning", tone: "info" },
  active: { label: "Active", tone: "success" },
  on_hold: { label: "On Hold", tone: "warning" },
  completed: { label: "Completed", tone: "neutral" },
};

export default async function ProjectsPage() {
  const [projects, clients, inspections] = await Promise.all([getProjects(), getClients(), getInspections()]);
  const inspectionCount = (projectId: string) =>
    inspections.filter((i) => i.project_id === projectId).length;
  return (
    <div className="space-y-6">
      <PageHeader title="Projects" description="Shutdowns, contracts and ongoing engagements.">
        <AddProject clients={clients.map((c) => ({ id: c.id, company_name: c.company_name }))} />
      </PageHeader>
      {projects.length === 0 ? (
        <EmptyState icon={<FolderKanban />} title="No projects yet" description="Create your first project to get started." />
      ) : (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}`} className="block">
          <Card className="h-full transition-colors hover:border-accent/40 hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <FolderKanban className="size-4" />
                </span>
                <Badge tone={STATUS[p.status].tone}>{STATUS[p.status].label}</Badge>
              </div>
              <CardTitle className="mt-2">{p.name}</CardTitle>
              <p className="text-sm text-muted">{p.client_name}</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Site" value={p.site_location ?? "—"} />
              <Row label="Start" value={formatDate(p.start_date)} />
              <Row label="End" value={formatDate(p.end_date)} />
              <Row label="Budget" value={p.budget ? formatSAR(p.budget, { compact: true }) : "—"} accent />
              <div className="flex items-center justify-between border-t border-border pt-2">
                <span className="flex items-center gap-1.5 text-steel-dim"><ClipboardCheck className="size-3.5" /> Inspections</span>
                <Badge tone={inspectionCount(p.id) ? "info" : "neutral"}>{inspectionCount(p.id)} linked</Badge>
              </div>
            </CardContent>
          </Card>
          </Link>
        ))}
      </div>
      )}
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-steel-dim">{label}</span>
      <span className={accent ? "font-semibold text-accent" : "text-steel"}>{value}</span>
    </div>
  );
}
