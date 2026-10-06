import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInDays, format, isValid, parseISO, startOfDay } from "date-fns";
import type { BitSightRating, Vendor } from "@/types";

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

export function todayIsoDate(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function isPastDate(date: string | null | undefined): boolean {
  if (!date) return false;
  const parsed = parseISO(date.slice(0, 10));
  return isValid(parsed) && startOfDay(parsed) < startOfDay(new Date());
}

export type ReviewStatusVariant = "overdue" | "upcoming" | "unreviewed" | "none";

export function getReviewStatus(nextReviewDate: string | null): {
  label: string;
  variant: ReviewStatusVariant;
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

/** Like getReviewStatus, but flags active vendors that have never been reviewed. */
export function getVendorReviewStatus(
  vendor: Pick<Vendor, "next_review_date" | "last_review_date" | "status">
): { label: string; variant: ReviewStatusVariant } {
  if (vendor.status === "Offboarded") return { label: "—", variant: "none" };
  if (!vendor.last_review_date) return { label: "Not reviewed", variant: "unreviewed" };
  return getReviewStatus(vendor.next_review_date);
}

export const RISK_COLORS = {
  Low: "#059669",
  Medium: "#d97706",
  High: "#dc2626",
  "Very High": "#a61e1e",
} as const;

export const BITSIGHT_MIN_SCORE = 250;
export const BITSIGHT_MAX_SCORE = 900;

const BITSIGHT_TIER_COLORS: Record<BitSightRating, string> = {
  Advanced: "#22c55e",
  Intermediate: "#f59e0b",
  Basic: "#f97316",
  Beginners: "#ef4444",
};

export function getBitSightColor(rating: string): string {
  return BITSIGHT_TIER_COLORS[rating as BitSightRating] ?? "#a1a1aa";
}

export function getBitSightScorePercent(score: number): number {
  const clamped = Math.min(Math.max(score, BITSIGHT_MIN_SCORE), BITSIGHT_MAX_SCORE);
  return ((clamped - BITSIGHT_MIN_SCORE) / (BITSIGHT_MAX_SCORE - BITSIGHT_MIN_SCORE)) * 100;
}
