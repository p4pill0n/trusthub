import { getRemediations, getVendors } from "@/lib/queries";
import { RemediationsClient } from "@/components/remediations/remediations-client";
import { PageHeader } from "@/components/layout/page-header";

export const dynamic = "force-dynamic";

export default async function RemediationsPage() {
  const [items, vendors] = await Promise.all([getRemediations(), getVendors()]);

  return (
    <div className="space-y-7">
      <PageHeader
        title="Remediations"
        description="Track remediations and control improvements across the vendor portfolio."
      />
      <RemediationsClient items={items} vendors={vendors} />
    </div>
  );
}
