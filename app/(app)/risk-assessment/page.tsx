import { getActiveVendors, getAssessments } from "@/lib/queries";
import { PageHeader } from "@/components/layout/page-header";
import { RiskAssessmentClient } from "@/components/risk-assessment/risk-assessment-client";
import { QuestionnaireReferenceTable } from "@/components/risk-assessment/questionnaire-reference-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QUESTIONNAIRE_CATEGORIES, QUESTIONNAIRE_QUESTIONS } from "@/lib/questionnaire";

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

      <Card className="border-border/80 shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">
            Third-party security risk questionnaire
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {QUESTIONNAIRE_QUESTIONS.length} questions across {QUESTIONNAIRE_CATEGORIES.length} risk
            areas sent to vendor partners.
          </p>
        </CardHeader>
        <CardContent>
          <QuestionnaireReferenceTable />
        </CardContent>
      </Card>
    </div>
  );
}
