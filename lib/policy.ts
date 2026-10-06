import { addMonths, format, isValid, parseISO } from "date-fns";
import type { TprmPolicy, TprmPolicyInput, Vendor } from "@/types";

export const DEFAULT_TPRM_POLICY: TprmPolicyInput = {
  review_months_low: 36,
  review_months_medium: 36,
  review_months_high: 24,
  review_months_very_high: 12,
};

export const MAX_REVIEW_MONTHS = 120;

export function reviewMonthsForRisk(policy: TprmPolicyInput, risk: string): number {
  switch (risk) {
    case "Low":
      return policy.review_months_low;
    case "Medium":
      return policy.review_months_medium;
    case "High":
      return policy.review_months_high;
    case "Very High":
    case "Critical":
      return policy.review_months_very_high;
    default:
      return policy.review_months_medium;
  }
}

/** Offboarded vendors are no longer on a review cadence. */
export function computeNextReviewDate(
  lastReviewDate: string | null | undefined,
  inherentRisk: string,
  policy: TprmPolicyInput,
  status?: string | null
): string | null {
  if (status === "Offboarded") return null;
  if (!lastReviewDate) return null;
  const parsed = parseISO(lastReviewDate.slice(0, 10));
  if (!isValid(parsed)) return null;
  const months = reviewMonthsForRisk(policy, inherentRisk);
  return format(addMonths(parsed, months), "yyyy-MM-dd");
}

type PolicyVendorFields = Pick<
  Vendor,
  "last_review_date" | "inherent_risk" | "next_review_date" | "status"
>;

export function applyPolicyToVendor<T extends PolicyVendorFields>(
  vendor: T,
  policy: TprmPolicyInput
): T {
  return {
    ...vendor,
    next_review_date: computeNextReviewDate(
      vendor.last_review_date,
      vendor.inherent_risk,
      policy,
      vendor.status
    ),
  };
}

export function applyPolicyToVendors<T extends PolicyVendorFields>(
  vendors: T[],
  policy: TprmPolicyInput
): T[] {
  return vendors.map((vendor) => applyPolicyToVendor(vendor, policy));
}

export function validatePolicyInput(input: TprmPolicyInput): string | null {
  for (const value of Object.values(input)) {
    if (!Number.isInteger(value) || value < 1 || value > MAX_REVIEW_MONTHS) {
      return `Review intervals must be whole numbers between 1 and ${MAX_REVIEW_MONTHS} months.`;
    }
  }
  return null;
}

export function withPolicyDefaults(row: Partial<TprmPolicy> | null | undefined): TprmPolicy {
  return {
    id: row?.id ?? "default",
    review_months_low: row?.review_months_low ?? DEFAULT_TPRM_POLICY.review_months_low,
    review_months_medium: row?.review_months_medium ?? DEFAULT_TPRM_POLICY.review_months_medium,
    review_months_high: row?.review_months_high ?? DEFAULT_TPRM_POLICY.review_months_high,
    review_months_very_high:
      row?.review_months_very_high ?? DEFAULT_TPRM_POLICY.review_months_very_high,
    updated_at: row?.updated_at ?? null,
  };
}
