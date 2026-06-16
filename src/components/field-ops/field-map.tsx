"use client";

import dynamic from "next/dynamic";
import type { Site } from "./map-inner";

const MapInner = dynamic(() => import("./map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-xl bg-navy-700 text-sm text-steel-dim">
      Loading map…
    </div>
  ),
});

export function FieldMap({ sites }: { sites: Site[] }) {
  return (
    <div className="h-[460px] w-full overflow-hidden rounded-xl border border-border">
      <MapInner sites={sites} />
    </div>
  );
}
