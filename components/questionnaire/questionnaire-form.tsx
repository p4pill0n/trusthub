"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { startQuestionnaire, submitQuestionnaire } from "@/lib/actions";
import {
  QUESTIONNAIRE_ANSWER_LABELS,
  QUESTIONNAIRE_CATEGORIES,
  QUESTIONNAIRE_QUESTIONS,
  type QuestionnaireAnswer,
} from "@/lib/questionnaire";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

const ANSWER_OPTIONS = (Object.keys(QUESTIONNAIRE_ANSWER_LABELS) as QuestionnaireAnswer[]).map(
  (value) => ({ value, label: QUESTIONNAIRE_ANSWER_LABELS[value] })
);

interface QuestionnaireFormProps {
  token: string;
  vendorName: string;
  isCompleted?: boolean;
  shouldMarkInProgress?: boolean;
  riskScore?: number | null;
}

function draftKey(token: string) {
  return `questionnaire-draft:${token}`;
}

export function QuestionnaireForm({
  token,
  vendorName,
  isCompleted = false,
  shouldMarkInProgress = false,
  riskScore,
}: QuestionnaireFormProps) {
  const [responses, setResponses] = useState<Record<string, QuestionnaireAnswer>>({});
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [isSubmitting, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(isCompleted);
  const [submittedScore, setSubmittedScore] = useState<number | null>(riskScore ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shouldMarkInProgress) {
      startQuestionnaire(token).catch(() => {
        // Non-blocking: the questionnaire can still be completed if the status update fails.
      });
    }
  }, [shouldMarkInProgress, token]);

  useEffect(() => {
    if (isCompleted) {
      window.localStorage.removeItem(draftKey(token));
      return;
    }
    try {
      const saved = window.localStorage.getItem(draftKey(token));
      if (saved) setResponses(JSON.parse(saved));
    } catch {
      window.localStorage.removeItem(draftKey(token));
    }
    setDraftLoaded(true);
  }, [isCompleted, token]);

  useEffect(() => {
    if (!draftLoaded || submitted) return;
    window.localStorage.setItem(draftKey(token), JSON.stringify(responses));
  }, [draftLoaded, responses, submitted, token]);

  const questionsByCategory = useMemo(() => {
    return QUESTIONNAIRE_CATEGORIES.map((category) => ({
      category,
      questions: QUESTIONNAIRE_QUESTIONS.filter((q) => q.category === category),
    }));
  }, []);

  const answeredCount = QUESTIONNAIRE_QUESTIONS.filter((q) => responses[q.id]).length;
  const allAnswered = answeredCount === QUESTIONNAIRE_QUESTIONS.length;

  function handleAnswer(questionId: string, answer: QuestionnaireAnswer) {
    setResponses((prev) => ({ ...prev, [questionId]: answer }));
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allAnswered) return;
    setError(null);

    startTransition(async () => {
      try {
        const result = await submitQuestionnaire(token, responses);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        window.localStorage.removeItem(draftKey(token));
        setSubmittedScore(result.riskScore);
        setSubmitted(true);
      } catch {
        setError("We could not submit your answers. Please try again; your progress is saved.");
      }
    });
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-16 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <h1 className="text-2xl font-semibold">Questionnaire submitted</h1>
        <p className="text-muted-foreground">
          Thank you. Your third-party security risk questionnaire for {vendorName} has been
          received.
          {submittedScore !== null ? ` Security score: ${submittedScore}/100.` : ""}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-2 border-b pb-6">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Third-party security risk questionnaire
        </p>
        <h1 className="text-2xl font-semibold">{vendorName}</h1>
        <p className="text-sm text-muted-foreground">
          Please answer all {QUESTIONNAIRE_QUESTIONS.length} questions. Select Yes, Partial, No,
          or N/A for each control area. Your answers are saved in this browser until you submit.
        </p>
        <p className="text-sm text-muted-foreground">
          Progress: {answeredCount}/{QUESTIONNAIRE_QUESTIONS.length}
        </p>
      </div>

      {questionsByCategory.map(({ category, questions }) => (
        <section key={category} className="space-y-4">
          <h2 className="text-lg font-semibold">{category}</h2>
          <div className="space-y-5">
            {questions.map((question, index) => (
              <div key={question.id} className="rounded-lg border border-border/80 bg-white p-4">
                <Label className="mb-3 block text-sm leading-relaxed">
                  {index + 1}. {question.text}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {ANSWER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={responses[question.id] === option.value}
                      onClick={() => handleAnswer(question.id, option.value)}
                      className={cn(
                        "rounded-md border px-3 py-1.5 text-sm transition-colors",
                        responses[question.id] === option.value
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-border bg-background hover:bg-muted/50"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="flex items-center justify-between gap-4 border-t pt-6">
        <p className={cn("text-sm", error ? "text-red-600" : "text-muted-foreground")}>
          {error ??
            (allAnswered
              ? "All questions answered. You may submit the questionnaire."
              : "Please answer every question before submitting.")}
        </p>
        <Button type="submit" disabled={isSubmitting || !allAnswered}>
          {isSubmitting ? "Submitting..." : "Submit questionnaire"}
        </Button>
      </div>
    </form>
  );
}
