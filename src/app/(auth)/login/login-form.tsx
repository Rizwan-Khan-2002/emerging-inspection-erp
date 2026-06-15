"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLE_LABELS } from "@/lib/constants";
import { signInDemo, signInWithPassword, signUpWithPassword } from "@/lib/actions/auth";
import type { Role } from "@/lib/types";

const DEMO_ROLES: Role[] = ["owner", "hr", "coordinator", "inspector", "client", "admin"];

export function LoginForm({ demoMode }: { demoMode: boolean }) {
  const [pending, startTransition] = useTransition();
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function pickRole(role: Role) {
    setActiveRole(role);
    startTransition(() => signInDemo(role));
  }

  function onSubmit(formData: FormData) {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const res = mode === "signup"
        ? await signUpWithPassword(formData)
        : await signInWithPassword(formData);
      if (res?.error) setError(res.error);
      if (res && "info" in res && res.info) setInfo(res.info);
    });
  }

  return (
    <div className="space-y-6">
      {demoMode && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-steel-dim">
            Quick demo sign-in — pick a role
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {DEMO_ROLES.map((r) => (
              <button
                key={r}
                onClick={() => pickRole(r)}
                disabled={pending}
                className="group flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-left text-sm font-medium transition-colors hover:border-accent/50 hover:bg-card-hover disabled:opacity-60"
              >
                <span>{ROLE_LABELS[r]}</span>
                {pending && activeRole === r ? (
                  <Loader2 className="size-4 animate-spin text-accent" />
                ) : (
                  <ArrowRight className="size-4 text-steel-dim transition-colors group-hover:text-accent" />
                )}
              </button>
            ))}
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-steel-dim">
            <span className="h-px flex-1 bg-border" />
            or sign in with credentials
            <span className="h-px flex-1 bg-border" />
          </div>
        </div>
      )}

      {!demoMode && (
        <div className="flex rounded-lg border border-border bg-navy-700 p-1 text-sm">
          <button
            onClick={() => { setMode("signin"); setError(null); setInfo(null); }}
            className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${mode === "signin" ? "bg-accent text-navy" : "text-steel"}`}
          >
            Sign in
          </button>
          <button
            onClick={() => { setMode("signup"); setError(null); setInfo(null); }}
            className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${mode === "signup" ? "bg-accent text-navy" : "text-steel"}`}
          >
            Create account
          </button>
        </div>
      )}

      <form action={onSubmit} className="space-y-4">
        {!demoMode && mode === "signup" && (
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" name="full_name" placeholder="Rizwan Khan" required />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@emerginginspection.com" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" placeholder="••••••••" minLength={6} required />
        </div>

        {error && (
          <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
        {info && (
          <p className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
            {info}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending && !activeRole ? <Loader2 className="size-4 animate-spin" /> : null}
          {mode === "signup" ? "Create account" : "Sign in"}
        </Button>

        {!demoMode && mode === "signup" && (
          <p className="text-center text-xs text-steel-dim">
            The first account created becomes the Super Admin.
          </p>
        )}
      </form>
    </div>
  );
}
