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
      <SelectTrigger className="h-8 w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(["Open", "In Progress", "Closed"] as const).map((s) => (
          <SelectItem key={s} value={s}>{s}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
