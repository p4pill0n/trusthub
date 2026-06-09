import { getInterconnections } from "@/lib/queries";
import { InterconnectionsClient } from "@/components/interconnections/interconnections-client";
import { PageHeader } from "@/components/layout/page-header";

export const dynamic = "force-dynamic";

export default async function InterconnectionsPage() {
  const interconnections = await getInterconnections();

  return (
    <div className="space-y-7">
      <PageHeader
        title="Interconnections"
        description="Data flows and technical connections between the bank and third-party vendors."
      />
      <InterconnectionsClient interconnections={interconnections} />
    </div>
  );
}
