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
import {
  IncidentFormFields,
  toDatetimeLocal,
  toIncidentInput,
  validateIncidentDraft,
  type IncidentDraft,
} from "@/components/incidents/incident-form-fields";
import { createIncident } from "@/lib/actions";
import type { Vendor } from "@/types";
import { ShieldAlert } from "lucide-react";

function emptyDraft(): IncidentDraft {
  return {
    title: "",
    description: "",
    severity: "Medium",
    status: "Open",
    detectedAt: toDatetimeLocal(new Date().toISOString()),
    resolvedAt: "",
  };
}

export function LogIncidentModal({ vendors }: { vendors: Vendor[] }) {
  const [open, setOpen] = useState(false);
  const [vendorId, setVendorId] = useState("");
  const [draft, setDraft] = useState<IncidentDraft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setVendorId("");
      setDraft(emptyDraft());
      setError(null);
    }
  }

  function handleSubmit() {
    if (!vendorId) {
      setError("Select a vendor.");
      return;
    }
    const invalid = validateIncidentDraft(draft);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        const result = await createIncident({ vendor_id: vendorId, ...toIncidentInput(draft) });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setOpen(false);
      } catch {
        setError("Failed to log incident. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <ShieldAlert className="h-4 w-4" />
          Log incident
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log security incident</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Vendor</Label>
            <Select value={vendorId} onValueChange={(v) => { setVendorId(v); setError(null); }}>
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
          <IncidentFormFields
            idPrefix="new-incident"
            draft={draft}
            onChange={(next) => {
              setDraft(next);
              setError(null);
            }}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !vendorId || !draft.title.trim()}>
            {isPending ? "Saving..." : "Log incident"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
