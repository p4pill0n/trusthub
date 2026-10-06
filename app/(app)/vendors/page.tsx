import { getExperts, getVendors } from "@/lib/queries";
import { VendorsPageClient } from "@/components/vendors/vendors-page-client";
import { PageHeader } from "@/components/layout/page-header";

export const dynamic = "force-dynamic";

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const [vendors, experts] = await Promise.all([getVendors(), getExperts()]);

  return (
    <div className="space-y-7">
      <PageHeader
        title="Vendors"
        description="Full register of third-party vendors with risk classifications and review status."
      />
      <VendorsPageClient
        vendors={vendors}
        experts={experts}
        initialSearch={searchParams.q ?? ""}
      />
    </div>
  );
}
