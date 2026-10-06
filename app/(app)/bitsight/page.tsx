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
        description="Latest BitSight security rating for each active vendor (scale 250–900)."
      />
      <BitSightClient ratings={ratings} />
    </div>
  );
}
