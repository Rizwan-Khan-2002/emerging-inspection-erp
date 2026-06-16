import { Info } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/common/empty-state";
import { UserRoleSelect } from "@/components/users/user-role-select";
import { AddTeamMember } from "@/components/users/add-team-member";
import { UserActions } from "@/components/users/user-actions";
import { getCurrentUser } from "@/lib/auth";
import { getProfiles } from "@/lib/data";
import { initials } from "@/lib/utils";

export const metadata = { title: "Users & Roles · Emerging ERP" };

export default async function UsersPage() {
  const [users, me] = await Promise.all([getProfiles(), getCurrentUser()]);

  return (
    <div className="space-y-6">
      <PageHeader title="Users & Roles" description="Real team members and their access. Change a role from the dropdown.">
        <AddTeamMember />
      </PageHeader>

      <div className="flex items-start gap-2 rounded-lg border border-info/30 bg-info/10 p-3 text-sm text-steel">
        <Info className="mt-0.5 size-4 shrink-0 text-info" />
        <p>New team members create an account at the login page (or you share the link). They start as <strong>Client</strong> — assign their real role here. (Email invites need the Resend integration.)</p>
      </div>

      {users.length === 0 ? (
        <EmptyState icon={<Info />} title="No users yet" description="Team members will appear here after they sign up." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8"><AvatarFallback>{initials(u.full_name)}</AvatarFallback></Avatar>
                        <span className="font-medium">{u.full_name}{me?.id === u.id && <span className="ml-2 text-xs text-accent">(you)</span>}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-steel">{u.email}</TableCell>
                    <TableCell><UserRoleSelect userId={u.id} role={u.role} self={me?.id === u.id} /></TableCell>
                    <TableCell><Badge tone={u.active ? "success" : "neutral"}>{u.active ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell>
                      <UserActions userId={u.id} name={u.full_name} active={u.active} self={me?.id === u.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
