import type { RemediationStatus } from "@/types";

export const REMEDIATION_STATUS_LABELS: Record<RemediationStatus, string> = {
  Open: "Not started",
  "In Progress": "In Progress",
  Closed: "Closed",
};

export const REMEDIATION_STATUS_STYLES: Record<RemediationStatus, string> = {
  Open: "border-red-200 bg-red-50 text-red-700",
  "In Progress": "border-amber-200 bg-amber-50 text-amber-700",
  Closed: "border-emerald-200 bg-emerald-50 text-emerald-700",
};
