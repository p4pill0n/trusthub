"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
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
import { getQuestionnaireUrl } from "@/lib/questionnaire";
import { CopyQuestionnaireLink } from "@/components/risk-assessment/copy-questionnaire-link";
import { SendQuestionnaireLink } from "@/components/risk-assessment/send-questionnaire-link";
import type { Vendor } from "@/types";
import { ClipboardList } from "lucide-react";

interface TriggerAssessmentModalProps {
  vendors: Vendor[];
  preselectedVendorId?: string;
}

export function TriggerAssessmentModal({ vendors, preselectedVendorId }: TriggerAssessmentModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(Boolean(preselectedVendorId));
  const [vendorId, setVendorId] = useState(preselectedVendorId ?? "");
  const [isPending, startTransition] = useTransition();
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const selectedVendor = vendors.find((v) => v.id === vendorId);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setVendorId("");
      setCreatedToken(null);
      setError(null);
      setAlreadyExists(false);
      if (preselectedVendorId) router.replace(pathname);
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
          }
          return;
        }
        setCreatedToken(result.token);
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
            risk assessment. Completing it updates the vendor&apos;s last review date.
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
                  {getQuestionnaireUrl(createdToken)}
                </code>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <CopyQuestionnaireLink token={createdToken} />
                  <SendQuestionnaireLink
                    token={createdToken}
                    contactEmail={selectedVendor?.contact_email}
                    vendorName={selectedVendor?.name ?? "Vendor"}
                    mode="send"
                  />
                </div>
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
