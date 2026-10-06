"use client";

import { useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateRemediationStatus } from "@/lib/actions";
import {
  REMEDIATION_STATUS_LABELS,
  REMEDIATION_STATUS_STYLES,
} from "@/lib/remediation-status";
import { cn } from "@/lib/utils";
import type { RemediationStatus } from "@/types";

interface RemediationStatusSelectProps {
  id: string;
  status: RemediationStatus;
}

export function RemediationStatusSelect({ id, status }: RemediationStatusSelectProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(value: string) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await updateRemediationStatus(id, value as RemediationStatus);
        if (!result.ok) setError(result.error);
      } catch {
        setError("Failed to update status.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Select value={status} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger
          className={cn("h-8 w-[7.5rem] border font-semibold", REMEDIATION_STATUS_STYLES[status])}
        >
          <SelectValue>{REMEDIATION_STATUS_LABELS[status]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {(["Open", "In Progress", "Closed"] as const).map((s) => (
            <SelectItem key={s} value={s}>
              {REMEDIATION_STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="max-w-[12rem] text-right text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
