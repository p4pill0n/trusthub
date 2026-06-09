import { getRankedFourthParties } from "@/lib/queries";
import { FourthPartiesClient } from "@/components/fourth-parties/fourth-parties-client";
import { PageHeader } from "@/components/layout/page-header";

export const dynamic = "force-dynamic";

export default async function FourthPartiesPage() {
  const ranked = await getRankedFourthParties();

  return (
    <div className="space-y-7">
      <PageHeader
        title="Fourth Parties"
        description="Downstream providers ranked by how often they appear across the vendor portfolio."
      />
      <FourthPartiesClient ranked={ranked} />
    </div>
  );
}
