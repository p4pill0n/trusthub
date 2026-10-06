import { getActiveVendors, getIncidents } from "@/lib/queries";
import { IncidentsClient } from "@/components/incidents/incidents-client";
import { LogIncidentModal } from "@/components/incidents/log-incident-modal";
import { PageHeader } from "@/components/layout/page-header";

export const dynamic = "force-dynamic";

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const [incidents, vendors] = await Promise.all([getIncidents(), getActiveVendors()]);
  const initialStatus =
    searchParams.status === "Open" || searchParams.status === "Resolved"
      ? searchParams.status
      : "all";

  return (
    <div className="space-y-7">
      <PageHeader
        title="Security Incidents"
        description="Track and manage security incidents reported by or affecting third-party vendors."
        action={<LogIncidentModal vendors={vendors} />}
      />
      <IncidentsClient incidents={incidents} initialStatus={initialStatus} />
    </div>
  );
}
