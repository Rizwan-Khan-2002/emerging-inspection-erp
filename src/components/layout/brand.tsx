import Image from "next/image";
import { cn } from "@/lib/utils";

/** Company wordmark / logo lockup — uses the saved company name & logo when available. */
export function Brand({
  compact, className, name, logoUrl,
}: {
  compact?: boolean;
  className?: string;
  name?: string;
  logoUrl?: string | null;
}) {
  const title = (name?.trim() || "Emerging Inspection").toUpperCase();
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <Image
          src={logoUrl || "/logo.png"}
          alt={name || "Emerging Inspection"}
          width={40}
          height={40}
          className="size-8 object-contain"
          priority
          unoptimized={!!logoUrl}
        />
      </div>
      {!compact && (
        <div className="min-w-0 leading-tight">
          <p className="max-w-[160px] truncate text-sm font-bold tracking-tight text-foreground" title={name}>
            {title}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-accent">
            Inspection ERP
          </p>
        </div>
      )}
    </div>
  );
}
