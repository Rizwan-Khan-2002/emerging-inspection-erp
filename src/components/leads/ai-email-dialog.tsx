"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Sparkles, Mail, RotateCcw, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { coldEmail, followUpEmail } from "@/lib/ai-templates";
import { logLeadActivity } from "@/lib/actions/lead-activities";
import type { Lead } from "@/lib/types";

export function AiEmailDialog({
  open, onOpenChange, lead,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lead: Lead | null;
}) {
  const [mode, setMode] = useState<"cold" | "follow">("cold");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState(false);

  // Load the AI template whenever lead/mode changes (only resets on those).
  useEffect(() => {
    if (!lead || !open) return;
    const e = mode === "cold" ? coldEmail(lead) : followUpEmail(lead);
    setSubject(e.subject);
    setBody(e.body);
  }, [lead, mode, open]);

  if (!lead) return null;

  function regenerate() {
    const e = mode === "cold" ? coldEmail(lead!) : followUpEmail(lead!);
    setSubject(e.subject);
    setBody(e.body);
  }

  async function copy() {
    await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const mailto = `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-accent" /> Email — {lead.company_name}
          </DialogTitle>
          <DialogDescription>
            Generate with AI or write/edit manually — fully editable.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "cold" | "follow")}>
            <TabsList>
              <TabsTrigger value="cold">Cold Email</TabsTrigger>
              <TabsTrigger value="follow">Follow-up</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={regenerate}>
              <RotateCcw /> Regenerate
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => { setSubject(""); setBody(""); }}>
              <Eraser /> Clear
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="subj">Subject</Label>
            <Input id="subj" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject…" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bd">Message</Label>
            <Textarea id="bd" value={body} onChange={(e) => setBody(e.target.value)} rows={14}
              placeholder="Write your email here, or use Regenerate for an AI draft…"
              className="resize-y text-sm leading-relaxed" />
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={copy}>
            {copied ? <Check className="text-success" /> : <Copy />} {copied ? "Copied" : "Copy"}
          </Button>
          <Button asChild>
            <a href={mailto} onClick={() => { void logLeadActivity(lead!.id, "email", subject || "Email sent", "Opened in mail client from CRM"); }}>
              <Mail /> Open in mail client
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
