"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveIncidents } from "@/lib/actions";
import type { IncidentSeverity, IncidentStatus, SecurityIncident } from "@/types";

interface IncidentEditSheetProps {
  incident: SecurityIncident;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SEVERITIES: IncidentSeverity[] = ["Low", "Medium", "High", "Critical"];
const STATUSES: IncidentStatus[] = ["Open", "Resolved"];

function toDatetimeLocal(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocal(value: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function IncidentEditSheet({ incident, open, onOpenChange }: IncidentEditSheetProps) {
  const router = useRouter();
  const [title, setTitle] = useState(incident.title);
  const [description, setDescription] = useState(incident.description ?? "");
  const [severity, setSeverity] = useState(incident.severity);
  const [detectedAt, setDetectedAt] = useState(toDatetimeLocal(incident.detected_at));
  const [resolvedAt, setResolvedAt] = useState(toDatetimeLocal(incident.resolved_at));
  const [status, setStatus] = useState(incident.status);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setTitle(incident.title);
    setDescription(incident.description ?? "");
    setSeverity(incident.severity);
    setDetectedAt(toDatetimeLocal(incident.detected_at));
    setResolvedAt(toDatetimeLocal(incident.resolved_at));
    setStatus(incident.status);
    setError(null);
  }, [open, incident]);

  function handleSave() {
    setError(null);
    const detected = fromDatetimeLocal(detectedAt);
    if (!title.trim()) {
      setError("Incident title is required.");
      return;
    }
    if (!detected) {
      setError("Detected date is required.");
      return;
    }

    startTransition(async () => {
      const result = await saveIncidents([
        {
          id: incident.id,
          title,
          description,
          severity,
          detected_at: detected,
          resolved_at: fromDatetimeLocal(resolvedAt),
          status,
        },
      ]);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
      router.refresh();
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

          <div className="space-y-2">
            <Label htmlFor={`incident-title-${incident.id}`}>Title</Label>
            <Input
              id={`incident-title-${incident.id}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`incident-description-${incident.id}`}>Description</Label>
            <Input
              id={`incident-description-${incident.id}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Incident description…"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as IncidentSeverity)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITIES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as IncidentStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
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
              <Label htmlFor={`incident-detected-${incident.id}`}>Detected At</Label>
              <Input
                id={`incident-detected-${incident.id}`}
                type="datetime-local"
                value={detectedAt}
                onChange={(e) => setDetectedAt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`incident-resolved-${incident.id}`}>Resolved At</Label>
              <Input
                id={`incident-resolved-${incident.id}`}
                type="datetime-local"
                value={resolvedAt}
                onChange={(e) => setResolvedAt(e.target.value)}
              />
            </div>
          </div>

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
