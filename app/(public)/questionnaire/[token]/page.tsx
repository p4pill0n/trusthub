import { getAssessmentByToken } from "@/lib/queries";
import { QuestionnaireForm } from "@/components/questionnaire/questionnaire-form";
import { notFound } from "next/navigation";
import type { QuestionnaireAnswer } from "@/lib/questionnaire";

export const dynamic = "force-dynamic";

export default async function QuestionnairePage({
  params,
}: {
  params: { token: string };
}) {
  const assessment = await getAssessmentByToken(params.token);
  if (!assessment) notFound();

  const vendorName = assessment.vendors?.name ?? "Vendor";
  const isCompleted = assessment.status === "Completed";

  return (
    <div className="px-6 py-10">
      <QuestionnaireForm
        token={params.token}
        vendorName={vendorName}
        initialResponses={assessment.responses as Record<string, QuestionnaireAnswer> | null}
        isCompleted={isCompleted}
        shouldMarkInProgress={assessment.status === "Pending"}
        riskScore={assessment.risk_score}
      />
    </div>
  );
}
