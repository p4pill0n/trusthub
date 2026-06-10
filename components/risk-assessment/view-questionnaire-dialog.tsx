"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  QUESTIONNAIRE_ANSWER_LABELS,
  QUESTIONNAIRE_CATEGORIES,
  QUESTIONNAIRE_QUESTIONS,
  type QuestionnaireAnswer,
} from "@/lib/questionnaire";
import { cn } from "@/lib/utils";

const ANSWER_STYLES: Record<QuestionnaireAnswer, string> = {
  yes: "border-emerald-200 bg-emerald-50 text-emerald-800",
  partial: "border-amber-200 bg-amber-50 text-amber-800",
  no: "border-red-200 bg-red-50 text-red-800",
  na: "border-border bg-muted/40 text-muted-foreground",
};

interface ViewQuestionnaireDialogProps {
  vendorName: string;
  mode: "preview" | "responses";
  responses?: Record<string, string> | null;
  riskScore?: number | null;
  children?: React.ReactNode;
}

export function ViewQuestionnaireDialog({
  vendorName,
  mode,
  responses,
  riskScore,
  children,
}: ViewQuestionnaireDialogProps) {
  const normalizedResponses = useMemo(() => {
    if (!responses) return {};
    return responses as Record<string, QuestionnaireAnswer>;
  }, [responses]);

  const answeredCount = QUESTIONNAIRE_QUESTIONS.filter((q) => normalizedResponses[q.id]).length;
  const hasResponses = answeredCount > 0;

  const questionsByCategory = useMemo(
    () =>
      QUESTIONNAIRE_CATEGORIES.map((category) => ({
        category,
        questions: QUESTIONNAIRE_QUESTIONS.filter((q) => q.category === category),
      })),
    []
  );

  const triggerLabel = mode === "responses" ? "View responses" : "View questionnaire";

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="link" className="h-auto p-0 text-sm font-medium text-foreground">
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="space-y-1 border-b px-6 py-4">
          <DialogTitle>
            {mode === "responses" ? "Questionnaire responses" : "Questionnaire"} — {vendorName}
          </DialogTitle>
          <DialogDescription>
            {mode === "responses" ? (
              hasResponses ? (
                <>
                  {answeredCount} of {QUESTIONNAIRE_QUESTIONS.length} questions answered
                  {riskScore !== null && riskScore !== undefined
                    ? ` · Risk score ${riskScore}/100`
                    : ""}
                </>
              ) : (
                <>
                  Risk score {riskScore ?? "—"}/100. Detailed responses were not recorded for this
                  assessment.
                </>
              )
            ) : (
              `${QUESTIONNAIRE_QUESTIONS.length} questions across ${QUESTIONNAIRE_CATEGORIES.length} risk areas sent to the vendor.`
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto px-6 py-4">
          {questionsByCategory.map(({ category, questions }) => (
            <section key={category} className="space-y-3">
              <h3 className="text-sm font-semibold">{category}</h3>
              <div className="space-y-3">
                {questions.map((question, index) => {
                  const answer = normalizedResponses[question.id];

                  return (
                    <div
                      key={question.id}
                      className="rounded-lg border border-border/80 bg-white p-3"
                    >
                      <p className="text-sm leading-relaxed">
                        {index + 1}. {question.text}
                      </p>
                      {mode === "responses" && (
                        <div className="mt-2">
                          {answer ? (
                            <span
                              className={cn(
                                "inline-flex rounded-md border px-2.5 py-0.5 text-xs font-semibold",
                                ANSWER_STYLES[answer]
                              )}
                            >
                              {QUESTIONNAIRE_ANSWER_LABELS[answer]}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not answered</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
