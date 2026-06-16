import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Building2, CalendarClock, Camera, FileDown, MapPin, User, ShieldCheck, Package,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusWorkflow } from "@/components/inspections/status-workflow";
import { PrioritySelect } from "@/components/inspections/priority-select";
import { Checklist } from "@/components/inspections/checklist";
import { SubmitReport } from "@/components/inspections/submit-report";
import { SitePhotos } from "@/components/inspections/site-photos";
import { AssigneeSelect } from "@/components/inspections/assignee-select";
import { INSPECTION_TYPE, ROLE_LABELS } from "@/lib/constants";
import { getInspectionById, getProfiles } from "@/lib/data";
import { formatDateTime, mapsUrl } from "@/lib/format";

export default async function InspectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [job, profiles] = await Promise.all([getInspectionById(id), getProfiles()]);
  if (!job) notFound();

  const staff = profiles.filter((p) => p.active !== false && p.role !== "client");
  const inspectorOpts = staff
    .filter((p) => ["inspector", "coordinator", "admin"].includes(p.role))
    .map((p) => ({ id: p.id, full_name: p.full_name, role: ROLE_LABELS[p.role] }));
  const coordinatorOpts = staff
    .filter((p) => ["coordinator", "admin", "owner", "super_admin"].includes(p.role))
    .map((p) => ({ id: p.id, full_name: p.full_name, role: ROLE_LABELS[p.role] }));

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link href="/inspections"><ArrowLeft /> Back to inspections</Link>
      </Button>

      <PageHeader title={job.ref} description={INSPECTION_TYPE[job.type]}>
        <PrioritySelect inspectionId={job.id} initial={job.priority} />
        <SubmitReport inspectionId={job.id} />
        <Button asChild variant="secondary">
          <a href={`/api/pdf/report/${job.id}`} target="_blank" rel="noreferrer"><FileDown /> Generate PDF Report</a>
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Status Workflow</CardTitle></CardHeader>
            <CardContent><StatusWorkflow inspectionId={job.id} initial={job.status} /></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Inspection Checklist</CardTitle></CardHeader>
            <CardContent><Checklist inspectionId={job.id} initial={job.checklist ?? []} /></CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Camera className="size-4 text-accent" /> Site Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <SitePhotos inspectionId={job.id} initial={job.photos ?? []} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Detail icon={<Building2 />} label="Client" value={job.client_name} />
              <Detail icon={<MapPin />} label="Site" value={job.site_location} />
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-steel-dim [&_svg]:size-4"><User /></div>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-xs text-steel-dim">Inspector</p>
                  <AssigneeSelect inspectionId={job.id} field="inspector_id" initial={job.inspector_id} options={inspectorOpts} placeholder="Assign inspector" />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-steel-dim [&_svg]:size-4"><User /></div>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-xs text-steel-dim">Coordinator</p>
                  <AssigneeSelect inspectionId={job.id} field="coordinator_id" initial={job.coordinator_id} options={coordinatorOpts} placeholder="Assign coordinator" />
                </div>
              </div>
              <Detail icon={<CalendarClock />} label="Scheduled" value={formatDateTime(job.scheduled_at)} />
              {job.approval_type && <Detail icon={<ShieldCheck />} label="Approval" value={job.approval_type === "aramco" ? "Aramco" : "Non-Aramco"} />}
              {job.qm_type && <Detail icon={<ShieldCheck />} label="QM Type" value={job.qm_type} />}
              {job.material && <Detail icon={<Package />} label="Material / Component" value={job.material} />}
              {job.project_name && <Detail icon={<Building2 />} label="Project" value={job.project_name} />}
            </CardContent>
          </Card>

          {job.lat != null && job.lng != null && (
            <Card>
              <CardHeader><CardTitle>Location</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex h-32 items-center justify-center rounded-lg border border-border bg-navy-700 text-steel-dim">
                  <MapPin className="size-6 text-accent" />
                </div>
                <p className="text-xs text-steel-dim">GPS: {job.lat}, {job.lng}</p>
                <Button asChild variant="secondary" className="w-full">
                  <a href={mapsUrl({ lat: job.lat, lng: job.lng })} target="_blank" rel="noreferrer">
                    <MapPin /> Open in Google Maps
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}

          {job.remarks && (
            <Card>
              <CardHeader><CardTitle>Remarks</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-steel">{job.remarks}</p></CardContent>
            </Card>
          )}
        </div>
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
