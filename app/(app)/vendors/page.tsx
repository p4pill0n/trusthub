import { getExperts, getVendors } from "@/lib/queries";
import { VendorsPageClient } from "@/components/vendors/vendors-page-client";
import { PageHeader } from "@/components/layout/page-header";

export const dynamic = "force-dynamic";

const REVIEW_FILTERS = new Set(["overdue", "upcoming", "due90", "unreviewed"]);

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: { q?: string; review?: string };
}) {
  const [vendors, experts] = await Promise.all([getVendors(), getExperts()]);
  const initialNextReview =
    searchParams.review && REVIEW_FILTERS.has(searchParams.review) ? searchParams.review : "all";

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
        initialNextReview={initialNextReview}
      />
    </div>
  );
}
