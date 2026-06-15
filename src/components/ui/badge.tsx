import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { BadgeTone } from "@/lib/constants";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "border-border bg-navy-700 text-steel",
        info: "border-info/30 bg-info/10 text-info",
        warning: "border-warning/30 bg-warning/10 text-warning",
        success: "border-success/30 bg-success/10 text-success",
        danger: "border-danger/30 bg-danger/10 text-danger",
        accent: "border-accent/40 bg-accent/10 text-accent",
        purple: "border-[#a78bfa]/30 bg-[#a78bfa]/10 text-[#c4b5fd]",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  tone?: BadgeTone;
}

function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

/** Small status dot used inside tables. */
function Dot({ tone = "neutral" }: { tone?: BadgeTone }) {
  const map: Record<BadgeTone, string> = {
    neutral: "bg-steel-dim",
    info: "bg-info",
    warning: "bg-warning",
    success: "bg-success",
    danger: "bg-danger",
    accent: "bg-accent",
    purple: "bg-[#a78bfa]",
  };
  return <span className={cn("size-1.5 rounded-full", map[tone])} />;
}

export { Badge, Dot, badgeVariants };
