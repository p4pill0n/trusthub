import { getVendors } from "@/lib/queries";
import { PageHeader } from "@/components/layout/page-header";
import { CreateBroadcastClient } from "@/components/broadcast/create-broadcast-client";

export const dynamic = "force-dynamic";

export default async function CreateBroadcastPage() {
  const vendors = await getVendors();
  const activeVendors = vendors.filter((v) => v.status !== "Offboarded");

  return (
    <div className="space-y-7">
      <PageHeader
        title="Create Broadcast"
        description="Send a communication to vendors across the portfolio and open follow-up tracking automatically."
      />
      <CreateBroadcastClient vendors={activeVendors} />
    </div>
  );
}
