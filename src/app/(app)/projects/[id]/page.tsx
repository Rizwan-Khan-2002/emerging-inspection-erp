import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, CalendarClock, FolderKanban, MapPin, Wallet, ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status-badge";
import { getProjectById, getInspections } from "@/lib/data";
import { INSPECTION_TYPE, JOB_STATUS, PRIORITY } from "@/lib/constants";
import { formatDate, formatDateTime, formatSAR } from "@/lib/format";
import type { BadgeTone } from "@/lib/constants";

const STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  planning: { label: "Planning", tone: "info" },
  active: { label: "Active", tone: "success" },
  on_hold: { label: "On Hold", tone: "warning" },
  completed: { label: "Completed", tone: "neutral" },
};

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, allInspections] = await Promise.all([getProjectById(id), getInspections()]);
  if (!project) notFound();

  const inspections = allInspections.filter((i) => i.project_id === project.id);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link href="/projects"><ArrowLeft /> Back to projects</Link>
      </Button>

      <PageHeader title={project.name} description={project.client_name}>
        <Badge tone={STATUS[project.status].tone}>{STATUS[project.status].label}</Badge>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="flex items-center gap-2"><FolderKanban className="size-4 text-accent" /> Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Detail icon={<Building2 />} label="Client" value={project.client_name ?? "—"} />
            <Detail icon={<MapPin />} label="Site" value={project.site_location ?? "—"} />
            <Detail icon={<CalendarClock />} label="Start" value={formatDate(project.start_date)} />
            <Detail icon={<CalendarClock />} label="End" value={formatDate(project.end_date)} />
            <Detail icon={<Wallet />} label="Budget" value={project.budget ? formatSAR(project.budget) : "—"} />
            <Detail icon={<ClipboardCheck />} label="Linked inspections" value={String(inspections.length)} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardCheck className="size-4 text-accent" /> Linked Inspections</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {inspections.length === 0 ? (
              <EmptyState
                icon={<ClipboardCheck />}
                title="No inspections linked yet"
                description="When creating an inspection, choose this project to link it here."
                className="border-0 p-6"
              />
            ) : (
              inspections.map((i) => (
                <Link key={i.id} href={`/inspections/${i.id}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-navy-700 p-3 transition-colors hover:border-accent/40">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{i.ref} · {INSPECTION_TYPE[i.type]}</p>
                    <p className="flex items-center gap-1 truncate text-xs text-steel-dim">
                      <MapPin className="size-3" /> {i.site_location}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge tone={PRIORITY[i.priority].tone}>{PRIORITY[i.priority].label}</Badge>
                    <StatusBadge status={JOB_STATUS[i.status]} />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-steel-dim [&_svg]:size-4">{icon}</div>
      <div>
        <p className="text-xs text-steel-dim">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
