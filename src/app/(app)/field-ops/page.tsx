import { PageHeader } from "@/components/common/page-header";
import { ModulePlaceholder } from "@/components/common/module-placeholder";

export const metadata = { title: "Field Ops · Emerging ERP" };

export default function FieldOpsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Field Operations Tracking" description="Live GPS movement, site visits and field timeline." />
      <ModulePlaceholder
        title="Field Operations & GPS Tracking"
        features={[
          "Live GPS location tracking of inspectors",
          "Multiple site visits per day",
          "Start/end job tracking with timestamps",
          "Travel distance & route logs",
          "Daily movement timeline per inspector",
          "Site arrival geo-verification",
          "Google Maps embedded live view",
          "Field activity feed for coordinators",
        ]}
      />
    </div>
  );
}
