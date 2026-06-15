import Image from "next/image";
import { cn } from "@/lib/utils";

/** Company wordmark / logo lockup using the real Emerging Inspection logo. */
export function Brand({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <Image
          src="/logo.png"
          alt="Emerging Inspection"
          width={40}
          height={40}
          className="size-8 object-contain"
          priority
        />
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight text-foreground">EMERGING</p>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-accent">
            Inspection ERP
          </p>
        </div>
      )}
    </div>
  );
}
