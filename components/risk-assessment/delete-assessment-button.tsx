"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteAssessment } from "@/lib/actions";

interface DeleteAssessmentButtonProps {
  id: string;
  vendorName: string;
}

export function DeleteAssessmentButton({ id, vendorName }: DeleteAssessmentButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `Delete the risk assessment for ${vendorName}? This cannot be undone.`
    );
    if (!confirmed) return;

    startTransition(async () => {
      await deleteAssessment(id);
    });
  }

  return (
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
  );
}
