"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardCheck, MapPin, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { InspectionFormDialog } from "./inspection-form-dialog";
import { createInspection } from "@/lib/actions/inspections";
import { INSPECTION_TYPE, JOB_STATUS, PRIORITY } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { shortId } from "@/lib/utils";
import type { Inspection, JobStatus } from "@/lib/types";
import type { InspectionFormValues } from "@/lib/validations/inspection";

export function InspectionsBoard({
  initial, clients,
}: {
  initial: Inspection[];
  clients: { id: string; company_name: string }[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<Inspection[]>(initial);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<JobStatus | "all">("all");
  const [type, setType] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [pending, start] = useTransition();

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const q = !query || [i.ref, i.client_name, i.site_location, i.inspector_name]
        .filter(Boolean).some((f) => f!.toLowerCase().includes(query.toLowerCase()));
      const st = status === "all" || i.status === status;
      const tp = type === "all" || i.type === type;
      return q && st && tp;
    });
  }, [items, query, status, type]);

  function handleSave(values: InspectionFormValues) {
    setFormOpen(false);
    start(async () => {
      const res = await createInspection(values);
      if (!res.ok) { alert(`Could not create inspection: ${res.error}`); return; }
      const clientName = clients.find((c) => c.id === values.client_id)?.company_name ?? "—";
      const item: Inspection = {
        id: shortId("I-"),
        ref: res.ref ?? "INS",
        type: values.type,
        client_id: values.client_id,
        client_name: clientName,
        site_location: values.site_location,
        scheduled_at: values.scheduled_at,
        priority: values.priority,
        status: values.status,
        remarks: values.remarks,
        checklist: [],
        photos: [],
        created_at: new Date().toISOString(),
      };
      setItems((prev) => [item, ...prev]);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-steel-dim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ref, client, site, inspector…"
            className="h-10 w-full rounded-lg border border-border bg-navy-700 pl-9 pr-3 text-sm placeholder:text-steel-dim focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="lg:w-52"><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {Object.entries(INSPECTION_TYPE).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as JobStatus | "all")}>
          <SelectTrigger className="lg:w-48"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(JOB_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => setFormOpen(true)}><Plus /> New Inspection</Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<ClipboardCheck />} title="No inspections found" description="Adjust filters or schedule a new inspection job." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Client / Site</TableHead>
                  <TableHead>Inspector</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((i) => (
                  <TableRow key={i.id} className="cursor-pointer">
                    <TableCell>
                      <Link href={`/inspections/${i.id}`} className="font-medium text-foreground hover:text-accent">
                        {i.ref}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{INSPECTION_TYPE[i.type]}</TableCell>
                    <TableCell>
                      <p className="text-sm">{i.client_name}</p>
                      <p className="flex items-center gap-1 text-xs text-steel-dim">
                        <MapPin className="size-3" /> {i.site_location}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-steel">{i.inspector_name ?? "Unassigned"}</TableCell>
                    <TableCell className="text-sm text-steel">{formatDateTime(i.scheduled_at)}</TableCell>
                    <TableCell><Badge tone={PRIORITY[i.priority].tone}>{PRIORITY[i.priority].label}</Badge></TableCell>
                    <TableCell><StatusBadge status={JOB_STATUS[i.status]} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <InspectionFormDialog open={formOpen} onOpenChange={setFormOpen} onSave={handleSave} clients={clients} pending={pending} />
    </div>
  );
}
