"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  IncidentFormFields,
  toDatetimeLocal,
  toIncidentInput,
  validateIncidentDraft,
  type IncidentDraft,
} from "@/components/incidents/incident-form-fields";
import { updateIncident } from "@/lib/actions";
import type { SecurityIncident } from "@/types";

interface IncidentEditSheetProps {
  incident: SecurityIncident;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toDraft(incident: SecurityIncident): IncidentDraft {
  return {
    title: incident.title,
    description: incident.description ?? "",
    severity: incident.severity,
    status: incident.status,
    detectedAt: toDatetimeLocal(incident.detected_at),
    resolvedAt: toDatetimeLocal(incident.resolved_at),
  };
}

export function IncidentEditSheet({ incident, open, onOpenChange }: IncidentEditSheetProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<IncidentDraft>(() => toDraft(incident));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setDraft(toDraft(incident));
    setError(null);
  }, [open, incident]);

  function handleSave() {
    const invalid = validateIncidentDraft(draft);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        const result = await updateIncident(incident.id, toIncidentInput(draft));
        if (!result.ok) {
          setError(result.error);
          return;
        }
        onOpenChange(false);
        router.refresh();
      } catch {
        setError("Failed to save incident.");
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Edit incident" onClose={() => onOpenChange(false)}>
        <div className="space-y-5">
          <div>
            <p className="text-sm text-muted-foreground">Vendor</p>
            <p className="font-medium">{incident.vendors?.name ?? "Vendor"}</p>
          </div>

          <IncidentFormFields
            idPrefix={`incident-${incident.id}`}
            draft={draft}
            onChange={(next) => {
              setDraft(next);
              setError(null);
            }}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 border-t border-border/80 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
