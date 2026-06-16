import { Globe, Palette, Plug } from "lucide-react";
import { cookies } from "next/headers";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompanyForm } from "@/components/settings/company-form";
import { ClearData } from "@/components/settings/clear-data";
import { getCompanySettings } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { normalizeLang } from "@/lib/i18n";

export const metadata = { title: "Settings · Emerging ERP" };

export default async function SettingsPage() {
  const [company, me, cookieStore] = await Promise.all([getCompanySettings(), getCurrentUser(), cookies()]);
  const lang = normalizeLang(cookieStore.get("lang")?.value);
  const aiOn = !!(process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY);
  const integrations = [
    { name: "Supabase", desc: "Database, Auth & Storage", on: isSupabaseConfigured },
    { name: "AI Emails (Gemini)", desc: "AI-written lead emails & summaries", on: aiOn },
    { name: "Resend", desc: "Transactional email delivery", on: !!process.env.RESEND_API_KEY },
    { name: "Field Map (OpenStreetMap)", desc: "GPS-tagged site map — no key needed", on: true },
    { name: "n8n", desc: "Workflow automation", on: !!process.env.N8N_WEBHOOK_URL },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Company profile, integrations and preferences." />

      <CompanyForm initial={company} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Plug className="size-4 text-accent" /> Integrations</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {integrations.map((i) => (
              <div key={i.name} className="flex items-center justify-between rounded-lg border border-border bg-navy-700 p-3">
                <div>
                  <p className="text-sm font-medium">{i.name}</p>
                  <p className="text-xs text-steel-dim">{i.desc}</p>
                </div>
                <Badge tone={i.on ? "success" : "neutral"}>{i.on ? "Connected" : "Not configured"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="size-4 text-accent" /> Appearance</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Theme" value="Industrial Dark (Navy / Orange)" />
            <Row label="Accent" value="Safety Orange #FF7A00" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="size-4 text-accent" /> Localization</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Language" value={lang === "ar" ? "العربية (RTL) · English" : "English · العربية (toggle in header)"} />
            <Row label="Date format" value="DD MMM YYYY" />
            <Row label="Currency" value={company.currency ?? "SAR"} />
          </CardContent>
        </Card>
      </div>

      {me?.role === "super_admin" && <ClearData />}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-steel-dim">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
