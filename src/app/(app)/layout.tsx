import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/auth";
import { getCompanySettings } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, company] = await Promise.all([getCurrentUser(), getCompanySettings()]);
  if (!user) redirect("/login");

  return (
    <AppShell
      user={user}
      demoMode={!isSupabaseConfigured}
      companyName={company.company_name}
      logoUrl={company.logo_url}
    >
      {children}
    </AppShell>
  );
}
