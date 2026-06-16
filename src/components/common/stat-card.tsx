import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  icon,
  trend,
  accent,
  href,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  trend?: { value: string; up: boolean };
  accent?: boolean;
  href?: string;
}) {
  const inner = (
    <Card className={cn("h-full p-5 transition-colors hover:border-accent/40", accent && "border-accent/40", href && "cursor-pointer")}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-steel-dim">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        {icon && (
          <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent [&_svg]:size-5">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs">
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              trend.up ? "text-success" : "text-danger"
            )}
          >
            {trend.up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {trend.value}
          </span>
        )}
        {sub && <span className="text-steel-dim">{sub}</span>}
      </div>
    </Card>
  );

  return href ? <Link href={href} className="block">{inner}</Link> : inner;
}
