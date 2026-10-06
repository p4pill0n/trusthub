import { getBroadcastRecipients, getBroadcasts } from "@/lib/queries";
import { PageHeader } from "@/components/layout/page-header";
import { BroadcastFollowUpClient } from "@/components/broadcast/broadcast-follow-up-client";

export const dynamic = "force-dynamic";

export default async function BroadcastFollowUpPage() {
  const [broadcasts, recipients] = await Promise.all([
    getBroadcasts(),
    getBroadcastRecipients(),
  ]);

  return (
    <div className="space-y-7">
      <PageHeader
        title="Follow-up"
        description="Select a broadcast campaign, then track acknowledgements and chase vendors that have not responded."
      />
      <BroadcastFollowUpClient broadcasts={broadcasts} recipients={recipients} />
    </div>
  );
}
