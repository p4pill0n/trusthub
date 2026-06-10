import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInDays, format, isValid, parseISO, startOfDay } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function formatParsedDate(date: string, pattern: string): string {
  const parsed = parseISO(date);
  if (!isValid(parsed)) return "—";
  return format(parsed, pattern);
}

export function formatDate(date: string | null): string {
  if (!date) return "—";
  return formatParsedDate(date, "yyyy-MM-dd");
}

export function formatDateTime(date: string | null): string {
  if (!date) return "—";
  return formatParsedDate(date, "yyyy-MM-dd HH:mm");
}

export function getReviewStatus(nextReviewDate: string | null): {
  label: string;
  variant: "overdue" | "upcoming" | "none";
} {
  if (!nextReviewDate) return { label: "—", variant: "none" };

  const today = startOfDay(new Date());
  const reviewDate = startOfDay(parseISO(nextReviewDate.slice(0, 10)));
  const days = differenceInDays(reviewDate, today);

  if (days < 0) {
    return { label: `${Math.abs(days)}d overdue`, variant: "overdue" };
  }
  return { label: `in ${days}d`, variant: "upcoming" };
}

export const RISK_COLORS = {
  Low: "#059669",
  Medium: "#d97706",
  High: "#dc2626",
  "Very High": "#a61e1e",
} as const;

export function getBitSightColor(score: number): string {
  if (score >= 750) return "#22c55e";
  if (score >= 640) return "#f59e0b";
  if (score >= 500) return "#f97316";
  return "#ef4444";
}
