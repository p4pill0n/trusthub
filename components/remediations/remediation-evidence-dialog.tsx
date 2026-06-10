"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RemediationEvidenceDialogProps {
  title: string;
  evidence: string | null;
}

export function RemediationEvidenceDialog({
  title,
  evidence,
}: RemediationEvidenceDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="h-auto p-0 text-sm font-medium text-foreground">
          See evidence
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Fix evidence — {title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {evidence ?? "No fix actions have been documented yet."}
        </p>
      </DialogContent>
    </Dialog>
  );
}
