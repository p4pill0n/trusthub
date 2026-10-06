import { differenceInDays, isValid, parseISO, startOfDay } from "date-fns";
import type { Assessment, AssessmentStatus } from "@/types";

/** Vendors have this many days to return a questionnaire before it is flagged overdue. */
export const ASSESSMENT_RESPONSE_DAYS = 30;

type StatusFields = Pick<Assessment, "status" | "launched_at" | "completed_at">;

export function isAssessmentOpen(assessment: StatusFields): boolean {
  return assessment.status !== "Completed" && !assessment.completed_at;
}

export function getAssessmentDisplayStatus(
  assessment: StatusFields,
  today: Date = new Date()
): AssessmentStatus {
  if (!isAssessmentOpen(assessment)) return "Completed";
  if (assessment.launched_at) {
    const launched = parseISO(assessment.launched_at);
    if (
      isValid(launched) &&
      differenceInDays(startOfDay(today), startOfDay(launched)) > ASSESSMENT_RESPONSE_DAYS
    ) {
      return "Overdue";
    }
  }
  return assessment.status === "In Progress" ? "In Progress" : "Pending";
}
