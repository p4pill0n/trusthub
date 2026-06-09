import { cn } from "@/lib/utils";
import type { AssessmentStatus } from "@/types";

const statusStyles: Record<AssessmentStatus, string> = {
  Pending: "bg-blue-50 text-blue-700 border-blue-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Overdue: "bg-red-50 text-red-800 border-red-200",
};

interface AssessmentStatusBadgeProps {
  status: AssessmentStatus;
  className?: string;
}

export function AssessmentStatusBadge({ status, className }: AssessmentStatusBadgeProps) {
  const style =
    statusStyles[status] ?? "bg-neutral-50 text-neutral-700 border-neutral-200";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        style,
        className
      )}
    >
      {status}
    </span>
  );
}
