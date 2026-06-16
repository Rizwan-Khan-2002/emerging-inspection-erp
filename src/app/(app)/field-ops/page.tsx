import { MapPin, Navigation, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/empty-state";
import { FieldMap } from "@/components/field-ops/field-map";
import type { Site } from "@/components/field-ops/map-inner";
import { getInspections } from "@/lib/data";
import { INSPECTION_TYPE, JOB_STATUS } from "@/lib/constants";
import { mapsUrl } from "@/lib/format";

export const metadata = { title: "Field Ops · Emerging ERP" };

export default async function FieldOpsPage() {
  const inspections = await getInspections();
  const sites: Site[] = inspections
    .filter((i) => i.lat != null && i.lng != null)
    .map((i) => ({
      id: i.id,
      ref: i.ref,
      title: INSPECTION_TYPE[i.type],
      client: i.client_name,
      lat: i.lat as number,
      lng: i.lng as number,
    }));

  const active = inspections.filter((i) => ["assigned", "in_progress"].includes(i.status));

  return (
    <div className="space-y-6">
      <PageHeader title="Field Operations" description="Live site map, GPS-tagged inspections and field activity." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Mapped Sites" value={sites.length} icon={<MapPin />} accent />
        <StatCard label="Active in Field" value={active.length} icon={<Navigation />} />
        <StatCard label="Total Jobs" value={inspections.length} icon={<ClipboardCheck />} />
        <StatCard label="With GPS" value={`${sites.length}/${inspections.length || 0}`} icon={<MapPin />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="size-4 text-accent" /> Site Map</CardTitle>
            <p className="text-sm text-muted">GPS-tagged inspection sites — add coordinates when creating an inspection.</p>
          </CardHeader>
          <CardContent>
            <FieldMap sites={sites} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Navigation className="size-4 text-accent" /> Field Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {active.length === 0 && sites.length === 0 ? (
              <EmptyState
                icon={<MapPin />}
                title="No field activity yet"
                description="Create an inspection with GPS coordinates — it will appear on the map and here."
                className="border-0 p-6"
              />
            ) : (
              inspections.slice(0, 8).map((i) => (
                <Link key={i.id} href={`/inspections/${i.id}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-navy-700 p-3 transition-colors hover:border-accent/40">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{INSPECTION_TYPE[i.type]}</p>
                    <p className="flex items-center gap-1 truncate text-xs text-steel-dim">
                      <MapPin className="size-3" /> {i.client_name} · {i.site_location}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {i.lat != null && (
                      <a href={mapsUrl({ lat: i.lat, lng: i.lng })} target="_blank" rel="noreferrer"
                        className="rounded p-1 text-steel-dim hover:text-accent" title="Open in Google Maps">
                        <Navigation className="size-4" />
                      </a>
                    )}
                    <Badge tone={JOB_STATUS[i.status].tone}>{JOB_STATUS[i.status].label}</Badge>
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
