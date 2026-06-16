"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export function DeleteButton({
  action, name, note,
}: {
  action: () => Promise<{ ok: boolean; error?: string }>;
  name: string;
  note?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <>
      <Button
        variant="ghost" size="icon-sm"
        className="text-steel-dim hover:text-danger"
        onClick={() => setOpen(true)}
        aria-label={`Delete ${name}`}
      >
        <Trash2 />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {name}?</DialogTitle>
            <DialogDescription>
              {note ?? `This permanently removes ${name} and all linked records.`} This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="danger" disabled={pending}
              onClick={() => start(async () => {
                const r = await action();
                if (!r.ok) { alert(r.error ?? "Delete failed"); return; }
                setOpen(false);
                router.refresh();
              })}
            >
              {pending && <Loader2 className="animate-spin" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
