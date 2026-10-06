"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AssessmentStatusBadge } from "@/components/risk-assessment/assessment-status-badge";
import { CopyQuestionnaireLink } from "@/components/risk-assessment/copy-questionnaire-link";
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

export function RiskAssessmentClient({
  assessments,
  vendors,
  preselectedVendorId,
}: RiskAssessmentClientProps) {
  const [statusFilter, setStatusFilter] = useState("all");

  const rows = useMemo(
    () =>
      assessments.map((assessment) => ({
        assessment,
        displayStatus: getAssessmentDisplayStatus(assessment),
      })),
    [assessments]
  );

  const filtered = rows.filter(
    ({ displayStatus }) => statusFilter === "all" || displayStatus === statusFilter
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              {STATUS_FILTERS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Open questionnaires become overdue {ASSESSMENT_RESPONSE_DAYS} days after launch.
          </p>
        </div>
        <TriggerAssessmentModal vendors={vendors} preselectedVendorId={preselectedVendorId} />
      </div>

      <div className="rounded-lg border border-border/80 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Launched</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Risk score</TableHead>
              <TableHead>Questionnaire</TableHead>
              <TableHead className="w-12 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
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
                        <CopyQuestionnaireLink token={assessment.questionnaire_token} />
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
