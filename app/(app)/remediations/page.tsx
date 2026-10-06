import { getActiveVendors, getAssessments, getRemediations } from "@/lib/queries";
import { RemediationsClient } from "@/components/remediations/remediations-client";
import { PageHeader } from "@/components/layout/page-header";
import { isAssessmentOpen } from "@/lib/assessment-status";

export const dynamic = "force-dynamic";

export default async function RemediationsPage({
  searchParams,
}: {
  searchParams: { vendor?: string; assessment?: string };
}) {
  const [items, vendors, assessments] = await Promise.all([
    getRemediations(),
    getActiveVendors(),
    getAssessments(),
  ]);

  const completedAssessments = assessments
    .filter((a) => !isAssessmentOpen(a))
    .map((a) => ({ id: a.id, vendor_id: a.vendor_id, completed_at: a.completed_at, risk_score: a.risk_score }));

  const preselectedVendorId = vendors.some((v) => v.id === searchParams.vendor)
    ? searchParams.vendor
    : undefined;
  const preselectedAssessmentId = completedAssessments.some(
    (a) => a.id === searchParams.assessment && a.vendor_id === preselectedVendorId
  )
    ? searchParams.assessment
    : undefined;

  return (
    <div className="space-y-7">
      <PageHeader
        title="Remediations"
        description="Track remediations and control improvements across the vendor portfolio."
      />
      <RemediationsClient
        items={items}
        vendors={vendors}
        assessments={completedAssessments}
        preselectedVendorId={preselectedVendorId}
        preselectedAssessmentId={preselectedAssessmentId}
      />
    </div>
  );
}
