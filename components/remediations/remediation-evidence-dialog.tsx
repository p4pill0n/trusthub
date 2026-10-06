"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateRemediationEvidence } from "@/lib/actions";
import { hasDocumentedEvidence } from "@/lib/remediation-status";
import type { RemediationStatus } from "@/types";

interface RemediationEvidenceDialogProps {
  id: string;
  title: string;
  evidence: string | null;
  status: RemediationStatus;
}

export function RemediationEvidenceDialog({
  id,
  title,
  evidence,
  status,
}: RemediationEvidenceDialogProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(evidence ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const documented = hasDocumentedEvidence(evidence);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setDraft(evidence ?? "");
      setError(null);
    }
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await updateRemediationEvidence(id, draft);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setOpen(false);
      } catch {
        setError("Failed to save evidence.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="link" className="h-auto p-0 text-sm font-medium text-foreground">
          {documented ? "See evidence" : "Add evidence"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Fix evidence — {title}</DialogTitle>
          <DialogDescription>
            Document the fix actions taken. Evidence is required before a remediation can be
            closed.
          </DialogDescription>
        </DialogHeader>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={6}
          placeholder="No fix actions have been documented yet."
          className="flex min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending || draft.trim() === (evidence ?? "").trim()}
          >
            {isPending ? "Saving…" : status === "Closed" ? "Update evidence" : "Save evidence"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
