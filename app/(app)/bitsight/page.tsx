import { getBitSightRatings } from "@/lib/queries";
import { BitSightClient } from "@/components/bitsight/bitsight-client";
import { PageHeader } from "@/components/layout/page-header";

export const dynamic = "force-dynamic";

export default async function BitSightPage() {
  const ratings = await getBitSightRatings();

  return (
    <div className="space-y-7">
      <PageHeader
        title="BitSight Ratings"
        description="Ratings sourced from BitSight API — refreshed weekly."
      />
      <BitSightClient ratings={ratings} />
    </div>
  );
}
