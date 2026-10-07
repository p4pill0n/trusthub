"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { startQuestionnaire, submitQuestionnaire } from "@/lib/actions";
import { supabase } from "@/lib/supabase";
import {
  QUESTIONNAIRE_ANSWER_LABELS,
  QUESTIONNAIRE_CATEGORIES,
  QUESTIONNAIRE_EVIDENCE_TYPES,
  QUESTIONNAIRE_QUESTIONS,
  evidenceTypeLabel,
  type QuestionnaireAnswer,
  type QuestionnaireEvidenceItem,
  type QuestionnaireEvidenceType,
} from "@/lib/questionnaire";
import { cn } from "@/lib/utils";
import { CheckCircle2, FileUp, Plus, Trash2 } from "lucide-react";

const ANSWER_OPTIONS = (Object.keys(QUESTIONNAIRE_ANSWER_LABELS) as QuestionnaireAnswer[]).map(
  (value) => ({ value, label: QUESTIONNAIRE_ANSWER_LABELS[value] })
);

const MAX_EVIDENCE_FILE_BYTES = 5 * 1024 * 1024;

interface QuestionnaireFormProps {
  token: string;
  vendorName: string;
  isCompleted?: boolean;
  shouldMarkInProgress?: boolean;
  riskScore?: number | null;
}

interface DraftEvidence {
  id: string;
  type: QuestionnaireEvidenceType;
  notes: string;
  file: File | null;
}

function draftKey(token: string) {
  return `questionnaire-draft:${token}`;
}

function newEvidenceDraft(type: QuestionnaireEvidenceType = "iso27001"): DraftEvidence {
  return {
    id: crypto.randomUUID(),
    type,
    notes: "",
    file: null,
  };
}

export function QuestionnaireForm({
  token,
  vendorName,
  isCompleted = false,
  shouldMarkInProgress = false,
  riskScore,
}: QuestionnaireFormProps) {
  const [responses, setResponses] = useState<Record<string, QuestionnaireAnswer>>({});
  const [evidenceDrafts, setEvidenceDrafts] = useState<DraftEvidence[]>([]);
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

  function addEvidence() {
    setEvidenceDrafts((prev) => [...prev, newEvidenceDraft()]);
    setError(null);
  }

  function updateEvidence(id: string, patch: Partial<DraftEvidence>) {
    setEvidenceDrafts((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeEvidence(id: string) {
    setEvidenceDrafts((prev) => prev.filter((item) => item.id !== id));
  }

  async function uploadEvidence(): Promise<QuestionnaireEvidenceItem[]> {
    const uploaded: QuestionnaireEvidenceItem[] = [];

    for (const draft of evidenceDrafts) {
      let file_name: string | null = null;
      let file_path: string | null = null;
      let file_url: string | null = null;

      if (draft.file) {
        if (draft.file.size > MAX_EVIDENCE_FILE_BYTES) {
          throw new Error(`${draft.file.name} is larger than 5 MB. Please upload a smaller file.`);
        }

        const safeName = draft.file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
        const path = `${token}/${draft.id}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("assessment-evidence")
          .upload(path, draft.file, {
            cacheControl: "3600",
            upsert: false,
            contentType: draft.file.type || undefined,
          });

        if (uploadError) {
          throw new Error(`Could not upload ${draft.file.name}: ${uploadError.message}`);
        }

        const { data: publicUrl } = supabase.storage.from("assessment-evidence").getPublicUrl(path);
        file_name = draft.file.name;
        file_path = path;
        file_url = publicUrl.publicUrl;
      }

      uploaded.push({
        id: draft.id,
        type: draft.type,
        label: evidenceTypeLabel(draft.type),
        notes: draft.notes.trim() || null,
        file_name,
        file_path,
        file_url,
      });
    }

    return uploaded;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allAnswered) return;
    setError(null);

    startTransition(async () => {
      try {
        const evidence = await uploadEvidence();
        const result = await submitQuestionnaire(token, responses, evidence);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        window.localStorage.removeItem(draftKey(token));
        setSubmittedScore(result.riskScore);
        setSubmitted(true);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "We could not submit your answers. Please try again; your progress is saved."
        );
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

      <section className="space-y-4 border-t pt-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Supporting evidence</h2>
            <p className="text-sm text-muted-foreground">
              Optionally attach certifications or reports such as ISO 27001, ISAE, or a penetration
              test summary.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={addEvidence} disabled={evidenceDrafts.length >= 10}>
            <Plus className="h-4 w-4" />
            Add evidence
          </Button>
        </div>

        {evidenceDrafts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No evidence added yet. You can submit without attachments if none are available.
          </p>
        ) : (
          <div className="space-y-3">
            {evidenceDrafts.map((item, index) => (
              <div key={item.id} className="space-y-3 rounded-lg border border-border/80 bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">Evidence {index + 1}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-muted-foreground"
                    onClick={() => removeEvidence(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`evidence-type-${item.id}`}>Document type</Label>
                    <Select
                      value={item.type}
                      onValueChange={(value) =>
                        updateEvidence(item.id, { type: value as QuestionnaireEvidenceType })
                      }
                    >
                      <SelectTrigger id={`evidence-type-${item.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QUESTIONNAIRE_EVIDENCE_TYPES.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`evidence-file-${item.id}`}>File (optional, max 5 MB)</Label>
                    <Input
                      id={`evidence-file-${item.id}`}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,application/pdf,image/*"
                      onChange={(e) =>
                        updateEvidence(item.id, { file: e.target.files?.[0] ?? null })
                      }
                    />
                    {item.file && (
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <FileUp className="h-3.5 w-3.5" />
                        {item.file.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`evidence-notes-${item.id}`}>Notes (optional)</Label>
                  <Input
                    id={`evidence-notes-${item.id}`}
                    value={item.notes}
                    onChange={(e) => updateEvidence(item.id, { notes: e.target.value })}
                    placeholder="e.g. Certificate valid through Dec 2026"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

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
