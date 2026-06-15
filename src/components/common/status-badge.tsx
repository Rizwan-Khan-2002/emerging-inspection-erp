import { Badge, Dot } from "@/components/ui/badge";
import type { BadgeTone } from "@/lib/constants";

/** Render a status badge from a {label, tone} map entry. */
export function StatusBadge({ status }: { status: { label: string; tone: BadgeTone } }) {
  return (
    <Badge tone={status.tone}>
      <Dot tone={status.tone} />
      {status.label}
    </Badge>
  );
}
