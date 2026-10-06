"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { launchAssessment } from "@/lib/actions";
import { CopyQuestionnaireLink } from "@/components/risk-assessment/copy-questionnaire-link";
import type { Vendor } from "@/types";
import { ClipboardList } from "lucide-react";

interface TriggerAssessmentModalProps {
  vendors: Vendor[];
}

export function TriggerAssessmentModal({ vendors }: TriggerAssessmentModalProps) {
  const [open, setOpen] = useState(false);
  const [vendorId, setVendorId] = useState("");
  const [isPending, startTransition] = useTransition();
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alreadyExists, setAlreadyExists] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setVendorId("");
      setCreatedToken(null);
      setCreatedUrl(null);
      setError(null);
      setAlreadyExists(false);
    }
  }

  function handleSubmit() {
    if (!vendorId) return;
    setError(null);
    setAlreadyExists(false);
    startTransition(async () => {
      try {
        const result = await launchAssessment(vendorId);
        if (!result.ok) {
          setError(result.error);
          if (result.existingToken) {
            setAlreadyExists(true);
            setCreatedToken(result.existingToken);
            setCreatedUrl(result.existingUrl);
          }
          return;
        }
        setCreatedToken(result.token);
        setCreatedUrl(result.url);
      } catch {
        setError("Failed to create assessment. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <ClipboardList className="h-4 w-4" />
          Trigger assessment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Trigger risk assessment</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Creates a secure questionnaire link for the vendor to complete their third-party security
            risk assessment.
          </p>
        </DialogHeader>

        {createdToken ? (
          <div className="space-y-4 py-2">
            {alreadyExists ? (
              <p className="text-sm text-amber-700">
                This vendor already has an open assessment. Share the existing questionnaire link
                below.
              </p>
            ) : (
              <p className="text-sm text-emerald-700">
                Assessment created. Share the link below with the vendor partner.
              </p>
            )}
            <div className="space-y-2">
              <Label>Questionnaire link</Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                <code className="min-w-0 flex-1 break-all rounded-md border bg-muted/40 px-3 py-2 text-xs leading-relaxed">
                  {createdUrl}
                </code>
                <CopyQuestionnaireLink token={createdToken} />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Select value={vendorId} onValueChange={setVendorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor..." />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter>
          {createdToken ? (
            <Button onClick={() => handleOpenChange(false)}>Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isPending || !vendorId}>
                {isPending ? "Creating..." : "Create assessment"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
