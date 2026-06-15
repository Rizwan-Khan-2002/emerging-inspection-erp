import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Used for modules scheduled in a later phase. Shows the planned feature set so
 * the navigation and IA are complete and the roadmap is visible to stakeholders.
 */
export function ModulePlaceholder({
  title,
  phase = "Phase 2",
  features,
}: {
  title: string;
  phase?: string;
  features: string[];
}) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border bg-gradient-to-r from-accent/10 to-transparent p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <Sparkles className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{title}</h2>
              <Badge tone="accent">{phase}</Badge>
            </div>
            <p className="text-sm text-muted">
              Module scaffolded — schema, navigation and permissions are wired. UI build scheduled next.
            </p>
          </div>
        </div>
      </div>
      <CardContent className="pt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-steel-dim">
          Planned capabilities
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-steel">
              <span className="size-1.5 rounded-full bg-accent" />
              {f}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
