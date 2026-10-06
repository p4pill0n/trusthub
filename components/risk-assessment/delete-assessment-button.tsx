"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteAssessment } from "@/lib/actions";

interface DeleteAssessmentButtonProps {
  id: string;
  vendorName: string;
}

export function DeleteAssessmentButton({ id, vendorName }: DeleteAssessmentButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    const confirmed = window.confirm(
      `Delete the risk assessment for ${vendorName}? This cannot be undone.`
    );
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      try {
        const result = await deleteAssessment(id);
        if (!result.ok) {
          setError(result.error);
        }
      } catch {
        setError("Failed to delete assessment. Please try again.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-red-600"
        onClick={handleDelete}
        disabled={isPending}
        aria-label={`Delete assessment for ${vendorName}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      {error && <p className="max-w-[12rem] text-right text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
