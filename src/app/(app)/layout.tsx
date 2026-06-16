import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/auth";
import { getCompanySettings } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { normalizeLang } from "@/lib/i18n";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, company, cookieStore] = await Promise.all([getCurrentUser(), getCompanySettings(), cookies()]);
  if (!user) redirect("/login");
  const lang = normalizeLang(cookieStore.get("lang")?.value);

  return (
    <AppShell
      user={user}
      demoMode={!isSupabaseConfigured}
      companyName={company.company_name}
      logoUrl={company.logo_url}
      lang={lang}
    >
      {children}
    </AppShell>
  );
}
