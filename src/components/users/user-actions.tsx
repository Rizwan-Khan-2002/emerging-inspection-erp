"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, KeyRound, UserX, UserCheck, Trash2, Loader2 } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { removeUser, resetUserPassword, setUserActive } from "@/lib/actions/admin";

export function UserActions({ userId, name, active, self }: {
  userId: string; name: string; active: boolean; self: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [removeOpen, setRemoveOpen] = useState(false);

  function doReset() {
    if (pw.length < 6) { alert("Password must be at least 6 characters."); return; }
    start(async () => {
      const res = await resetUserPassword(userId, pw);
      if (!res.ok) { alert(res.error ?? "Failed"); return; }
      setPwOpen(false);
      alert(`Password updated for ${name}. Share the new password with them.`);
      setPw("");
    });
  }
  function toggleActive() {
    start(async () => { await setUserActive(userId, !active); router.refresh(); });
  }
  function doRemove() {
    start(async () => {
      const res = await removeUser(userId);
      if (!res.ok) { alert(res.error ?? "Failed"); return; }
      setRemoveOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-md p-1.5 text-steel hover:bg-card-hover focus:outline-none">
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setPwOpen(true); }}>
            <KeyRound /> Reset password
          </DropdownMenuItem>
          {!self && (
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); toggleActive(); }}>
              {active ? <><UserX /> Deactivate</> : <><UserCheck /> Activate</>}
            </DropdownMenuItem>
          )}
          {!self && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => { e.preventDefault(); setRemoveOpen(true); }}
                className="text-danger focus:bg-danger/10"
              >
                <Trash2 /> Remove user
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Reset password */}
      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset password</DialogTitle>
            <DialogDescription>Set a new password for {name}, then share it with them.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>New password</Label>
            <Input value={pw} onChange={(e) => setPw(e.target.value)} placeholder="min 6 characters" autoFocus />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPwOpen(false)}>Cancel</Button>
            <Button onClick={doReset} disabled={pending}>{pending && <Loader2 className="animate-spin" />} Update password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove confirm */}
      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove {name}?</DialogTitle>
            <DialogDescription>
              This permanently deletes their account and access. Any employee record linked to them is also removed. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRemoveOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={doRemove} disabled={pending}>{pending && <Loader2 className="animate-spin" />} Remove user</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
