"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnSelectFilter,
  ColumnTextFilter,
  FilterHead,
  includesText,
  withAllOption,
} from "@/components/shared/column-filters";
import { AssessmentStatusBadge } from "@/components/risk-assessment/assessment-status-badge";
import { CopyQuestionnaireLink } from "@/components/risk-assessment/copy-questionnaire-link";
import { SendQuestionnaireLink } from "@/components/risk-assessment/send-questionnaire-link";
import { TriggerAssessmentModal } from "@/components/risk-assessment/trigger-assessment-modal";
import { DeleteAssessmentButton } from "@/components/risk-assessment/delete-assessment-button";
import { ViewQuestionnaireDialog } from "@/components/risk-assessment/view-questionnaire-dialog";
import { VendorNameCell } from "@/components/vendors/vendor-name-cell";
import {
  ASSESSMENT_RESPONSE_DAYS,
  getAssessmentDisplayStatus,
  isAssessmentOpen,
} from "@/lib/assessment-status";
import { formatDate } from "@/lib/utils";
import type { Assessment, AssessmentStatus, Vendor } from "@/types";

interface RiskAssessmentClientProps {
  assessments: Assessment[];
  vendors: Vendor[];
  preselectedVendorId?: string;
}

const STATUS_FILTERS: AssessmentStatus[] = ["Pending", "In Progress", "Overdue", "Completed"];

type AssessmentFilters = {
  vendor: string;
  status: string;
  launched: string;
  completed: string;
  score: string;
  questionnaire: string;
};

const EMPTY_FILTERS: AssessmentFilters = {
  vendor: "",
  status: "all",
  launched: "",
  completed: "",
  score: "",
  questionnaire: "",
};

function questionnaireLabel(isOpen: boolean, vendorOffboarded: boolean) {
  if (isOpen && vendorOffboarded) return "Vendor offboarded";
  if (isOpen) return "View questionnaire Copy link Send reminder";
  return "View responses Add remediation";
}

export function RiskAssessmentClient({
  assessments,
  vendors,
  preselectedVendorId,
}: RiskAssessmentClientProps) {
  const [filters, setFilters] = useState<AssessmentFilters>(EMPTY_FILTERS);

  const setFilter = <K extends keyof AssessmentFilters>(key: K, value: AssessmentFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const filtersActive = (Object.keys(filters) as (keyof AssessmentFilters)[]).some(
    (key) => filters[key] !== EMPTY_FILTERS[key]
  );

  const rows = useMemo(
    () =>
      assessments.map((assessment) => ({
        assessment,
        displayStatus: getAssessmentDisplayStatus(assessment),
      })),
    [assessments]
  );

  const filtered = useMemo(
    () =>
      rows.filter(({ assessment, displayStatus }) => {
        const isOpen = isAssessmentOpen(assessment);
        const vendorOffboarded = assessment.vendors?.status === "Offboarded";
        const scoreLabel =
          assessment.risk_score !== null ? `${assessment.risk_score}/100` : "—";

        if (!includesText(assessment.vendors?.name, filters.vendor)) return false;
        if (filters.status !== "all" && displayStatus !== filters.status) return false;
        if (!includesText(formatDate(assessment.launched_at), filters.launched)) return false;
        if (!includesText(formatDate(assessment.completed_at), filters.completed)) return false;
        if (!includesText(scoreLabel, filters.score)) return false;
        if (!includesText(questionnaireLabel(isOpen, vendorOffboarded), filters.questionnaire)) {
          return false;
        }
        return true;
      }),
    [rows, filters]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Open questionnaires become overdue {ASSESSMENT_RESPONSE_DAYS} days after launch.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {filtersActive && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFilters(EMPTY_FILTERS)}
            >
              Clear filters
            </Button>
          )}
          <TriggerAssessmentModal vendors={vendors} preselectedVendorId={preselectedVendorId} />
        </div>
      </div>

      <div className="rounded-lg border border-border/80 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead columnKey="vendor">Vendor</TableHead>
              <TableHead columnKey="status">Status</TableHead>
              <TableHead columnKey="launched">Launched</TableHead>
              <TableHead columnKey="completed">Completed</TableHead>
              <TableHead columnKey="score">Security score</TableHead>
              <TableHead columnKey="questionnaire">Questionnaire</TableHead>
              <TableHead columnKey="actions" className="w-12 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
            <TableRow className="hover:bg-transparent">
              <FilterHead columnKey="vendor">
                <ColumnTextFilter
                  value={filters.vendor}
                  onChange={(v) => setFilter("vendor", v)}
                  placeholder="Vendor…"
                />
              </FilterHead>
              <FilterHead columnKey="status">
                <ColumnSelectFilter
                  value={filters.status}
                  onChange={(v) => setFilter("status", v)}
                  placeholder="Status"
                  options={withAllOption(STATUS_FILTERS)}
                />
              </FilterHead>
              <FilterHead columnKey="launched">
                <ColumnTextFilter
                  value={filters.launched}
                  onChange={(v) => setFilter("launched", v)}
                  placeholder="Launched…"
                />
              </FilterHead>
              <FilterHead columnKey="completed">
                <ColumnTextFilter
                  value={filters.completed}
                  onChange={(v) => setFilter("completed", v)}
                  placeholder="Completed…"
                />
              </FilterHead>
              <FilterHead columnKey="score">
                <ColumnTextFilter
                  value={filters.score}
                  onChange={(v) => setFilter("score", v)}
                  placeholder="Score…"
                />
              </FilterHead>
              <FilterHead columnKey="questionnaire">
                <ColumnTextFilter
                  value={filters.questionnaire}
                  onChange={(v) => setFilter("questionnaire", v)}
                  placeholder="Action…"
                />
              </FilterHead>
              <FilterHead columnKey="actions" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(({ assessment, displayStatus }) => {
              const vendorName = assessment.vendors?.name ?? "Vendor";
              const isOpen = isAssessmentOpen(assessment);
              const vendorOffboarded = assessment.vendors?.status === "Offboarded";
              const dialogProps = {
                vendorName,
                mode: isOpen ? ("preview" as const) : ("responses" as const),
                responses: assessment.responses,
                riskScore: assessment.risk_score,
                evidence: assessment.evidence,
              };

              return (
                <TableRow key={assessment.id}>
                  <TableCell className="font-medium">
                    <VendorNameCell
                      vendorId={assessment.vendor_id}
                      name={assessment.vendors?.name}
                      contactEmail={assessment.vendors?.contact_email}
                    />
                  </TableCell>
                  <TableCell>
                    <AssessmentStatusBadge status={displayStatus} />
                  </TableCell>
                  <TableCell>{formatDate(assessment.launched_at)}</TableCell>
                  <TableCell>{formatDate(assessment.completed_at)}</TableCell>
                  <TableCell>
                    {assessment.risk_score !== null ? (
                      <ViewQuestionnaireDialog {...dialogProps}>
                        <button
                          type="button"
                          className="text-sm font-semibold text-foreground underline-offset-4 hover:underline"
                        >
                          {assessment.risk_score}/100
                        </button>
                      </ViewQuestionnaireDialog>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <ViewQuestionnaireDialog {...dialogProps} />
                      {isOpen && !vendorOffboarded && (
                        <>
                          <CopyQuestionnaireLink token={assessment.questionnaire_token} />
                          <SendQuestionnaireLink
                            token={assessment.questionnaire_token}
                            contactEmail={assessment.vendors?.contact_email}
                            vendorName={vendorName}
                            mode="reminder"
                          />
                        </>
                      )}
                      {isOpen && vendorOffboarded && (
                        <span className="text-xs text-muted-foreground">Vendor offboarded</span>
                      )}
                      {!isOpen && !vendorOffboarded && (
                        <Link
                          href={`/remediations?vendor=${assessment.vendor_id}&assessment=${assessment.id}`}
                          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                        >
                          Add remediation
                        </Link>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DeleteAssessmentButton id={assessment.id} vendorName={vendorName} />
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No risk assessments found. Trigger an assessment to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-muted-foreground">
        {filtered.length} of {assessments.length} assessments
      </p>
    </div>
  );
}
