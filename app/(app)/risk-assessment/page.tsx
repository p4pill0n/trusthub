import { getActiveVendors, getAssessments } from "@/lib/queries";
import { PageHeader } from "@/components/layout/page-header";
import { RiskAssessmentClient } from "@/components/risk-assessment/risk-assessment-client";
export const dynamic = "force-dynamic";

export default async function RiskAssessmentPage({
  searchParams,
}: {
  searchParams: { vendor?: string };
}) {
  const [assessments, vendors] = await Promise.all([getAssessments(), getActiveVendors()]);
  const preselectedVendorId = vendors.some((v) => v.id === searchParams.vendor)
    ? searchParams.vendor
    : undefined;

  return (
    <div className="space-y-7">
      <PageHeader
        title="Risk Assessments"
        description="Manage third-party security risk assessments. Trigger questionnaires and track vendor responses across key risk areas."
        descriptionClassName="mt-2 text-sm text-muted-foreground whitespace-nowrap"
      />

      <RiskAssessmentClient
        assessments={assessments}
        vendors={vendors}
        preselectedVendorId={preselectedVendorId}
      />
    </div>
  );
}
