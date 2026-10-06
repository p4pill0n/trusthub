import { getAssessmentByToken } from "@/lib/queries";
import { QuestionnaireForm } from "@/components/questionnaire/questionnaire-form";
import { notFound } from "next/navigation";
import { isAssessmentOpen } from "@/lib/assessment-status";

export const dynamic = "force-dynamic";

export default async function QuestionnairePage({
  params,
}: {
  params: { token: string };
}) {
  const assessment = await getAssessmentByToken(params.token);
  if (!assessment) notFound();

  const vendorName = assessment.vendors?.name ?? "Vendor";

  if (assessment.vendors?.status === "Offboarded" && isAssessmentOpen(assessment)) {
    return (
      <div className="mx-auto max-w-2xl space-y-3 px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold">Questionnaire closed</h1>
        <p className="text-muted-foreground">
          This questionnaire for {vendorName} is no longer accepting responses. Please contact
          your relationship manager if you believe this is a mistake.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 py-10">
      <QuestionnaireForm
        token={params.token}
        vendorName={vendorName}
        isCompleted={!isAssessmentOpen(assessment)}
        shouldMarkInProgress={assessment.status === "Pending"}
        riskScore={assessment.risk_score}
      />
    </div>
  );
}
