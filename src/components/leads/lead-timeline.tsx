"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Phone, Mail, MessageCircle, StickyNote, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLeadActivities, logLeadActivity, type LeadActivity } from "@/lib/actions/lead-activities";
import { formatDateTime } from "@/lib/format";
import type { Lead } from "@/lib/types";

const TYPE_META: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
  note: { icon: <StickyNote className="size-3.5" />, label: "Note", cls: "bg-steel/15 text-steel" },
  call: { icon: <Phone className="size-3.5" />, label: "Call", cls: "bg-info/15 text-info" },
  email: { icon: <Mail className="size-3.5" />, label: "Email", cls: "bg-accent/15 text-accent" },
  whatsapp: { icon: <MessageCircle className="size-3.5" />, label: "WhatsApp", cls: "bg-success/15 text-success" },
};

export function LeadTimeline({
  lead, open, onOpenChange,
}: {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [items, setItems] = useState<LeadActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("note");
  const [text, setText] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    if (open && lead) {
      setLoading(true);
      getLeadActivities(lead.id).then((a) => { setItems(a); setLoading(false); });
    }
  }, [open, lead]);

  function add() {
    if (!lead || !text.trim()) return;
    start(async () => {
      const r = await logLeadActivity(lead.id, type, undefined, text.trim());
      if (!r.ok) { alert(r.error ?? "Could not log activity"); return; }
      setText("");
      setItems(await getLeadActivities(lead.id));
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Activity — {lead?.company_name}</DialogTitle>
          <DialogDescription>Contact history, emails and notes for this lead.</DialogDescription>
        </DialogHeader>

        {/* Add new */}
        <div className="space-y-2 rounded-lg border border-border bg-navy-700 p-3">
          <div className="flex items-center gap-2">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_META).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={add} disabled={pending || !text.trim()} className="ml-auto">
              {pending ? <Loader2 className="animate-spin" /> : null} Log
            </Button>
          </div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What happened? e.g. Called procurement, sent revised quote…"
            rows={2}
          />
        </div>

        {/* Timeline */}
        <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
          {loading ? (
            <p className="py-6 text-center text-sm text-steel-dim"><Loader2 className="mx-auto size-4 animate-spin" /></p>
          ) : items.length === 0 ? (
            <p className="flex flex-col items-center gap-2 py-8 text-center text-sm text-steel-dim">
              <Clock className="size-5" /> No activity logged yet.
            </p>
          ) : (
            items.map((a) => {
              const meta = TYPE_META[a.type] ?? TYPE_META.note;
              return (
                <div key={a.id} className="flex gap-3">
                  <span className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${meta.cls}`}>
                    {meta.icon}
                  </span>
                  <div className="min-w-0 flex-1 border-b border-border pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{a.subject ?? meta.label}</p>
                      <span className="shrink-0 text-xs text-steel-dim">{formatDateTime(a.created_at)}</span>
                    </div>
                    {a.body && <p className="mt-0.5 whitespace-pre-wrap text-sm text-steel">{a.body}</p>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
