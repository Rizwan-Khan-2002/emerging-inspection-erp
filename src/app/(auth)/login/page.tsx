import { CheckCircle2 } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { LoginForm } from "./login-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const HIGHLIGHTS = [
  "Field inspections, reports & approvals in one workflow",
  "Automated overtime & payroll calculation",
  "Live GPS field-ops tracking & fuel claims",
  "AI-assisted CRM, quotations & client reporting",
];

export default function LoginPage() {
  return (
    <div className="app-shell-bg grid min-h-screen lg:grid-cols-2">
      {/* Brand / value panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border p-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <Brand />
        <div className="relative space-y-6">
          <h1 className="max-w-md text-3xl font-bold leading-tight">
            The operations backbone for{" "}
            <span className="text-accent">industrial inspection</span> companies.
          </h1>
          <ul className="space-y-3">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-center gap-3 text-sm text-steel">
                <CheckCircle2 className="size-5 shrink-0 text-accent" />
                {h}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-steel-dim">
          Built for Saudi Arabia / GCC · Scaffolding · NDT · QA/QC · Plant Maintenance · Shutdowns
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden">
            <Brand />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted">Sign in to your operations workspace.</p>
          </div>
          <LoginForm demoMode={!isSupabaseConfigured} />
        </div>
      </div>
    </div>
  );
}
