"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle, MoreHorizontal, Pencil, Plus, Search, Sparkles, Target, Phone,
  FileDown, FileUp, Loader2, History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { LeadFormDialog } from "./lead-form-dialog";
import { AiEmailDialog } from "./ai-email-dialog";
import { LeadTimeline } from "./lead-timeline";
import { LEAD_SOURCE_LABELS, LEAD_STATUS } from "@/lib/constants";
import { formatDate, formatSAR, whatsappUrl } from "@/lib/format";
import { whatsappMessage } from "@/lib/ai-templates";
import { createLead, importLeads, updateLead } from "@/lib/actions/leads";
import { exportToExcel, parseExcelFile } from "@/lib/excel";
import type { Lead, LeadStatus } from "@/lib/types";
import type { LeadFormValues } from "@/lib/validations/lead";

export function LeadsBoard({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [aiLead, setAiLead] = useState<Lead | null>(null);
  const [timelineLead, setTimelineLead] = useState<Lead | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, startImport] = useTransition();

  // Keep board in sync with server data (after import / refresh).
  useEffect(() => { setLeads(initialLeads); }, [initialLeads]);

  function handleExport() {
    const rows = leads.map((l) => ({
      company_name: l.company_name, industry: l.industry, contact_person: l.contact_person,
      position: l.position ?? "", email: l.email ?? "", phone: l.phone ?? "", whatsapp: l.whatsapp ?? "",
      country: l.country, city: l.city ?? "", source: l.source, status: l.status,
      estimated_value: l.estimated_value ?? 0, follow_up_date: l.follow_up_date ?? "", notes: l.notes ?? "",
    }));
    exportToExcel(rows, `leads-${new Date().toISOString().slice(0, 10)}`, "Leads");
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    startImport(async () => {
      try {
        const rows = await parseExcelFile(file);
        const res = await importLeads(rows);
        if (!res.ok) { alert(res.error ?? "Import failed"); return; }
        alert(`✅ Imported ${res.count} lead(s).`);
        router.refresh();
      } catch {
        alert("Could not read the file. Use a .xlsx or .csv file.");
      } finally {
        if (fileRef.current) fileRef.current.value = "";
      }
    });
  }

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchesQuery =
        !query ||
        [l.company_name, l.contact_person, l.email, l.city, l.industry]
          .filter(Boolean)
          .some((f) => f!.toLowerCase().includes(query.toLowerCase()));
      const matchesStatus = status === "all" || l.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [leads, query, status]);

  const pipelineValue = filtered
    .filter((l) => !["won", "lost"].includes(l.status))
    .reduce((sum, l) => sum + (l.estimated_value ?? 0), 0);
  const wonValue = leads.filter((l) => l.status === "won").reduce((s, l) => s + (l.estimated_value ?? 0), 0);

  function handleSave(values: LeadFormValues) {
    const target = editing;
    setFormOpen(false);
    setEditing(null);
    startTransition(async () => {
      const res = target ? await updateLead(target.id, values) : await createLead(values);
      if (res.error) {
        alert(`Could not save lead: ${res.error}`);
        return;
      }
      if (res.data) {
        const saved = res.data;
        setLeads((prev) =>
          target ? prev.map((l) => (l.id === target.id ? saved : l)) : [saved, ...prev]
        );
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Pipeline summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryChip label="Total Leads" value={String(leads.length)} />
        <SummaryChip label="Open Pipeline" value={formatSAR(pipelineValue, { compact: true })} accent />
        <SummaryChip label="Won Value" value={formatSAR(wonValue, { compact: true })} tone="success" />
        <SummaryChip
          label="Win Rate"
          value={`${Math.round((leads.filter((l) => l.status === "won").length / Math.max(leads.length, 1)) * 100)}%`}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-steel-dim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company, contact, city…"
            className="h-10 w-full rounded-lg border border-border bg-navy-700 pl-9 pr-3 text-sm placeholder:text-steel-dim focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as LeadStatus | "all")}>
          <SelectTrigger className="sm:w-48"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(LEAD_STATUS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImportFile} />
        <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={importing}>
          {importing ? <Loader2 className="animate-spin" /> : <FileUp />} Import
        </Button>
        <Button variant="secondary" onClick={handleExport} disabled={!leads.length}>
          <FileDown /> Export
        </Button>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus /> New Lead
        </Button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Target />}
          title="No leads found"
          description="Adjust your search or add a new lead to the pipeline."
          action={<Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus /> New Lead</Button>}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Follow-up</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>
                      <p className="font-medium">{l.company_name}</p>
                      <p className="text-xs text-steel-dim">{l.industry} · {l.city ?? l.country}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{l.contact_person}</p>
                      <p className="text-xs text-steel-dim">{l.position ?? l.email}</p>
                    </TableCell>
                    <TableCell><StatusBadge status={LEAD_STATUS[l.status]} /></TableCell>
                    <TableCell className="text-sm text-steel">{LEAD_SOURCE_LABELS[l.source]}</TableCell>
                    <TableCell className="text-right font-medium">
                      {l.estimated_value ? formatSAR(l.estimated_value, { compact: true }) : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-steel">{formatDate(l.follow_up_date)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="rounded-md p-1.5 text-steel hover:bg-card-hover focus:outline-none">
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => { setEditing(l); setFormOpen(true); }}>
                            <Pencil /> Edit lead
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setTimelineLead(l)}>
                            <History /> Activity timeline
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setAiLead(l)}>
                            <Sparkles /> AI email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {l.whatsapp && (
                            <DropdownMenuItem asChild>
                              <a href={whatsappUrl(l.whatsapp, whatsappMessage(l))} target="_blank" rel="noreferrer">
                                <MessageCircle /> WhatsApp
                              </a>
                            </DropdownMenuItem>
                          )}
                          {l.phone && (
                            <DropdownMenuItem asChild>
                              <a href={`tel:${l.phone}`}><Phone /> Call</a>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <LeadFormDialog open={formOpen} onOpenChange={setFormOpen} initial={editing} onSave={handleSave} />
      <AiEmailDialog open={!!aiLead} onOpenChange={(v) => !v && setAiLead(null)} lead={aiLead} />
      <LeadTimeline lead={timelineLead} open={!!timelineLead} onOpenChange={(v) => !v && setTimelineLead(null)} />
    </div>
  );
}

function SummaryChip({
  label, value, accent, tone,
}: { label: string; value: string; accent?: boolean; tone?: "success" }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-xs text-steel-dim">{label}</p>
      <p className={`mt-0.5 text-lg font-semibold ${accent ? "text-accent" : tone === "success" ? "text-success" : ""}`}>
        {value}
      </p>
    </div>
  );
}
