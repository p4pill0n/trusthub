import { getExperts } from "@/lib/queries";
import { PageHeader } from "@/components/layout/page-header";
import { ExpertsClient } from "@/components/experts/experts-client";

export const dynamic = "force-dynamic";

export default async function ExpertsPage() {
  const experts = await getExperts();

  return (
    <div className="space-y-7">
      <PageHeader
        title="Experts"
        description="Regional contacts for TPRM, Cyber, BCM, Operational Risk, Legal, and Compliance."
      />
      <ExpertsClient experts={experts} />
    </div>
  );
}
