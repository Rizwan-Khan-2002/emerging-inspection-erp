import { PageHeader } from "@/components/common/page-header";
import { ModulePlaceholder } from "@/components/common/module-placeholder";

export const metadata = { title: "Documents · Emerging ERP" };

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Document Management" description="Certificates, contracts and compliance documents." />
      <ModulePlaceholder
        title="Document Management"
        features={[
          "Central document repository (Supabase Storage)",
          "Employee documents — Iqama, passport, certs",
          "Expiry reminders for certificates & licenses",
          "Client contracts & agreements",
          "Inspection certificates archive",
          "Role-based document access control",
        ]}
      />
    </div>
  );
}
