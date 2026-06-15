import { ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { getCurrentUser } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/constants";
import { becomeSuperAdmin } from "@/lib/actions/admin";

export const metadata = { title: "Setup · Emerging ERP" };

export default async function SetupPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader title="First-time Setup" description="Bootstrap your owner / admin access." />

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="font-semibold">{user?.full_name ?? "You"}</p>
              <p className="text-sm text-steel-dim">
                {user?.email} · Current role:{" "}
                <span className="font-medium text-foreground">
                  {user ? ROLE_LABELS[user.role] : "—"}
                </span>
              </p>
            </div>
          </div>

          <p className="text-sm text-steel">
            Click below to make this account the <strong className="text-accent">Super Admin</strong>.
            You&apos;ll get full access to every module. After it completes you may be asked to
            sign in again to refresh your session.
          </p>

          <form action={becomeSuperAdmin}>
            <Button type="submit" size="lg" className="w-full">
              <ShieldCheck /> Make me Super Admin
            </Button>
          </form>

          <p className="text-xs text-steel-dim">
            Bootstrap tool — once your team is set up, an admin assigns roles from the Users page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
