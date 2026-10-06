"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IncidentSeverity, IncidentStatus } from "@/types";

export const INCIDENT_SEVERITIES: IncidentSeverity[] = ["Low", "Medium", "High", "Critical"];
export const INCIDENT_STATUSES: IncidentStatus[] = ["Open", "Resolved"];

export type IncidentDraft = {
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  detectedAt: string;
  resolvedAt: string;
};

export function toDatetimeLocal(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocal(value: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

/** Returns a validation message, or null when the draft can be saved. */
export function validateIncidentDraft(draft: IncidentDraft): string | null {
  if (!draft.title.trim()) return "Incident title is required.";
  const detected = fromDatetimeLocal(draft.detectedAt);
  if (!detected) return "Detected date is required.";
  if (new Date(detected) > new Date()) return "Detected date cannot be in the future.";
  if (draft.status === "Resolved" && draft.resolvedAt) {
    const resolved = fromDatetimeLocal(draft.resolvedAt);
    if (!resolved) return "Resolved date is invalid.";
    if (new Date(resolved) < new Date(detected)) {
      return "Resolved date must be after the detected date.";
    }
  }
  return null;
}

export function toIncidentInput(draft: IncidentDraft) {
  return {
    title: draft.title,
    description: draft.description,
    severity: draft.severity,
    status: draft.status,
    detected_at: fromDatetimeLocal(draft.detectedAt) as string,
    resolved_at: draft.status === "Resolved" ? fromDatetimeLocal(draft.resolvedAt) : null,
  };
}

interface IncidentFormFieldsProps {
  idPrefix: string;
  draft: IncidentDraft;
  onChange: (draft: IncidentDraft) => void;
}

export function IncidentFormFields({ idPrefix, draft, onChange }: IncidentFormFieldsProps) {
  function set<K extends keyof IncidentDraft>(key: K, value: IncidentDraft[K]) {
    onChange({ ...draft, [key]: value });
  }

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-title`}>Title</Label>
        <Input
          id={`${idPrefix}-title`}
          value={draft.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-description`}>Description</Label>
        <textarea
          id={`${idPrefix}-description`}
          value={draft.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Incident description…"
          rows={4}
          className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Severity</Label>
          <Select value={draft.severity} onValueChange={(v) => set("severity", v as IncidentSeverity)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INCIDENT_SEVERITIES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={draft.status}
            onValueChange={(v) =>
              onChange({
                ...draft,
                status: v as IncidentStatus,
                resolvedAt: v === "Open" ? "" : draft.resolvedAt || toDatetimeLocal(new Date().toISOString()),
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INCIDENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-detected`}>Detected At</Label>
          <Input
            id={`${idPrefix}-detected`}
            type="datetime-local"
            value={draft.detectedAt}
            onChange={(e) => set("detectedAt", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-resolved`}>Resolved At</Label>
          <Input
            id={`${idPrefix}-resolved`}
            type="datetime-local"
            value={draft.resolvedAt}
            disabled={draft.status !== "Resolved"}
            onChange={(e) => set("resolvedAt", e.target.value)}
          />
        </div>
      </div>
    </>
  );
}
