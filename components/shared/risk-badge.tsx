import { cn } from "@/lib/utils";

function normalizeRiskLevel(level: string): string {
  return level === "Critical" ? "Very High" : level;
}

const pillStyles: Record<string, string> = {
  Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  High: "bg-red-50 text-red-800 border-red-200",
  "Very High": "bg-red-100 text-red-800 border-red-300",
};

interface RiskBadgeProps {
  level: string;
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const displayLevel = normalizeRiskLevel(level);
  const pill = pillStyles[displayLevel] ?? "bg-neutral-50 text-neutral-700 border-neutral-200";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        pill,
        className
      )}
    >
      {displayLevel}
    </span>
  );
}

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-xs font-medium text-neutral-700 whitespace-nowrap",
        className
      )}
    >
      {status}
    </span>
  );
}
