import { PageHeader } from "@/components/layout/page-header";
import { QuestionnaireReferenceTable } from "@/components/risk-assessment/questionnaire-reference-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QUESTIONNAIRE_CATEGORIES, QUESTIONNAIRE_QUESTIONS } from "@/lib/questionnaire";

export default function QuestionnairePage() {
  return (
    <div className="space-y-7">
      <PageHeader
        title="Questionnaire"
        description="The third-party security risk questionnaire sent to vendors when an assessment is triggered."
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
          <p className="text-sm text-muted-foreground">
            Security score: Yes = 100, Partial = 50, No = 0, N/A excluded, averaged out of 100.
            A higher score means stronger controls and lower residual risk.
          </p>
        </CardHeader>
        <CardContent>
          <QuestionnaireReferenceTable />
        </CardContent>
      </Card>
    </div>
  );
}
