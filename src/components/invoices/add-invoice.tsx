"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { invoiceSchema, type InvoiceFormValues } from "@/lib/validations/entities";
import { createInvoice } from "@/lib/actions/entities";

const EMPTY: InvoiceFormValues = { client_id: "", amount: 0, due_date: "", status: "draft" };

export function AddInvoice({ clients }: { clients: { id: string; company_name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<InvoiceFormValues>({ resolver: zodResolver(invoiceSchema) as Resolver<InvoiceFormValues>, defaultValues: EMPTY });
  const amount = watch("amount") || 0;

  function onSubmit(v: InvoiceFormValues) {
    setErr(null);
    start(async () => {
      const res = await createInvoice(v);
      if (!res.ok) { setErr(res.error ?? "Failed"); return; }
      setOpen(false); reset(EMPTY); router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) reset(EMPTY); }}>
      <DialogTrigger asChild><Button><Plus /> New Invoice</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>New Invoice</DialogTitle><DialogDescription>15% KSA VAT added automatically. Number auto-generated.</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Client</Label>
            <Select value={watch("client_id")} onValueChange={(v) => setValue("client_id", v)}>
              <SelectTrigger><SelectValue placeholder={clients.length ? "Select client" : "Add a client first"} /></SelectTrigger>
              <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}</SelectContent>
            </Select>
            {errors.client_id && <p className="text-xs text-danger">{errors.client_id.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Amount (SAR)</Label><Input type="number" {...register("amount")} /></div>
            <div className="space-y-1.5"><Label>Due Date</Label><Input type="date" {...register("due_date")} /></div>
          </div>
          <div className="rounded-md border border-border bg-navy-700 p-3 text-sm">
            <div className="flex justify-between text-steel"><span>VAT (15%)</span><span>{(amount * 0.15).toFixed(2)} SAR</span></div>
            <div className="mt-1 flex justify-between font-semibold"><span>Total</span><span className="text-accent">{(amount * 1.15).toFixed(2)} SAR</span></div>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={watch("status")} onValueChange={(v) => setValue("status", v as InvoiceFormValues["status"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem><SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem><SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {err && <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{err}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending && <Loader2 className="animate-spin" />} Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
