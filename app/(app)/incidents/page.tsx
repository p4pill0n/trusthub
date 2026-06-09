import { getIncidents } from "@/lib/queries";
import { IncidentsClient } from "@/components/incidents/incidents-client";
import { PageHeader } from "@/components/layout/page-header";

export const dynamic = "force-dynamic";

export default async function IncidentsPage() {
  const incidents = await getIncidents();

  return (
    <div className="space-y-7">
      <PageHeader
        title="Security Incidents"
        description="Track and manage security incidents reported by or affecting third-party vendors."
      />
      <IncidentsClient incidents={incidents} />
    </div>
  );
}
