import { getAssessments, getVendors } from "@/lib/queries";
import { PageHeader } from "@/components/layout/page-header";
import { RiskAssessmentClient } from "@/components/risk-assessment/risk-assessment-client";
import { QuestionnaireReferenceTable } from "@/components/risk-assessment/questionnaire-reference-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QUESTIONNAIRE_QUESTIONS } from "@/lib/questionnaire";

export const dynamic = "force-dynamic";

export default async function RiskAssessmentPage() {
  const [assessments, vendors] = await Promise.all([getAssessments(), getVendors()]);

  return (
    <div className="space-y-7">
      <PageHeader
        title="Risk Assessment"
        description="Manage third-party security risk assessments. Trigger questionnaires and track vendor responses across key risk areas."
      />

      <RiskAssessmentClient assessments={assessments} vendors={vendors} />

      <Card className="border-border/80 shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">
            Third-party security risk questionnaire
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {QUESTIONNAIRE_QUESTIONS.length} questions across {new Set(QUESTIONNAIRE_QUESTIONS.map((q) => q.category)).size} risk areas sent to vendor partners.
          </p>
        </CardHeader>
        <CardContent>
          <QuestionnaireReferenceTable />
        </CardContent>
      </Card>
    </div>
  );
}
