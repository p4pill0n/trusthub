import { getActiveVendors } from "@/lib/queries";
import { PageHeader } from "@/components/layout/page-header";
import { CreateBroadcastClient } from "@/components/broadcast/create-broadcast-client";

export const dynamic = "force-dynamic";

export default async function CreateBroadcastPage() {
  const activeVendors = await getActiveVendors();

  return (
    <div className="space-y-7">
      <PageHeader
        title="Create Broadcast"
        description="Log a communication to vendors across the portfolio, email the recipients, and track follow-up."
      />
      <CreateBroadcastClient vendors={activeVendors} />
    </div>
  );
}
