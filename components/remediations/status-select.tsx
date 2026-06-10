"use client";

import { useTransition } from "react";
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

  function handleChange(value: string) {
    startTransition(async () => {
      await updateRemediationStatus(id, value as RemediationStatus);
    });
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger
        className={cn(
          "h-8 w-[7.5rem] border font-semibold",
          REMEDIATION_STATUS_STYLES[status]
        )}
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
  );
}
