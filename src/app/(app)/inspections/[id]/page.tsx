import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Building2, CalendarClock, Camera, FileDown, MapPin, User, ShieldCheck, Package,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusWorkflow } from "@/components/inspections/status-workflow";
import { Checklist } from "@/components/inspections/checklist";
import { SubmitReport } from "@/components/inspections/submit-report";
import { INSPECTION_TYPE, PRIORITY } from "@/lib/constants";
import { getInspectionById } from "@/lib/data";
import { formatDateTime, mapsUrl } from "@/lib/format";

export default async function InspectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getInspectionById(id);
  if (!job) notFound();

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link href="/inspections"><ArrowLeft /> Back to inspections</Link>
      </Button>

      <PageHeader title={job.ref} description={INSPECTION_TYPE[job.type]}>
        <Badge tone={PRIORITY[job.priority].tone}>{PRIORITY[job.priority].label} priority</Badge>
        <SubmitReport inspectionId={job.id} />
        <Button asChild variant="secondary">
          <a href={`/api/pdf/report/${job.id}`} target="_blank" rel="noreferrer"><FileDown /> Generate PDF Report</a>
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Status Workflow</CardTitle></CardHeader>
            <CardContent><StatusWorkflow initial={job.status} /></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Inspection Checklist</CardTitle></CardHeader>
            <CardContent><Checklist initial={job.checklist ?? []} /></CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Camera className="size-4 text-accent" /> Site Photos</CardTitle>
              <Button variant="secondary" size="sm"><Camera /> Upload</Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-border bg-navy-700 text-steel-dim">
                    <Camera className="size-5" />
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-steel-dim">Photo upload connects to Supabase Storage in production.</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Detail icon={<Building2 />} label="Client" value={job.client_name} />
              <Detail icon={<MapPin />} label="Site" value={job.site_location} />
              <Detail icon={<User />} label="Inspector" value={job.inspector_name ?? "Unassigned"} />
              <Detail icon={<User />} label="Coordinator" value={job.coordinator_name ?? "—"} />
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
