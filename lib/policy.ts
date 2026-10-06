import { addMonths, format, isValid, parseISO } from "date-fns";
import type { TprmPolicy, TprmPolicyInput } from "@/types";
import type { Vendor } from "@/types";

export const DEFAULT_TPRM_POLICY: TprmPolicyInput = {
  review_months_low: 36,
  review_months_medium: 36,
  review_months_high: 24,
  review_months_very_high: 12,
};

export function reviewMonthsForRisk(
  policy: Pick<
    TprmPolicyInput,
    | "review_months_low"
    | "review_months_medium"
    | "review_months_high"
    | "review_months_very_high"
  >,
  risk: string
): number {
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

export function computeNextReviewDate(
  lastReviewDate: string | null | undefined,
  inherentRisk: string,
  policy: TprmPolicyInput
): string | null {
  if (!lastReviewDate) return null;
  const parsed = parseISO(lastReviewDate.slice(0, 10));
  if (!isValid(parsed)) return null;
  const months = reviewMonthsForRisk(policy, inherentRisk);
  return format(addMonths(parsed, months), "yyyy-MM-dd");
}

export function applyPolicyToVendor<T extends Pick<Vendor, "last_review_date" | "inherent_risk" | "next_review_date">>(
  vendor: T,
  policy: TprmPolicyInput
): T {
  return {
    ...vendor,
    next_review_date: computeNextReviewDate(vendor.last_review_date, vendor.inherent_risk, policy),
  };
}

export function applyPolicyToVendors<T extends Pick<Vendor, "last_review_date" | "inherent_risk" | "next_review_date">>(
  vendors: T[],
  policy: TprmPolicyInput
): T[] {
  return vendors.map((vendor) => applyPolicyToVendor(vendor, policy));
}

export function withPolicyDefaults(row: Partial<TprmPolicy> | null | undefined): TprmPolicy {
  return {
    id: row?.id ?? "default",
    ...DEFAULT_TPRM_POLICY,
    review_months_low: row?.review_months_low ?? DEFAULT_TPRM_POLICY.review_months_low,
    review_months_medium: row?.review_months_medium ?? DEFAULT_TPRM_POLICY.review_months_medium,
    review_months_high: row?.review_months_high ?? DEFAULT_TPRM_POLICY.review_months_high,
    review_months_very_high:
      row?.review_months_very_high ?? DEFAULT_TPRM_POLICY.review_months_very_high,
    updated_at: row?.updated_at ?? null,
  };
}
