"use client";

import { useState } from "react";
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
import { VendorNameCell } from "@/components/vendors/vendor-name-cell";
import { formatDateTime } from "@/lib/utils";
import type { Assessment, Vendor } from "@/types";

interface RiskAssessmentClientProps {
  assessments: Assessment[];
  vendors: Vendor[];
}

export function RiskAssessmentClient({ assessments, vendors }: RiskAssessmentClientProps) {
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = assessments.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            {["Pending", "In Progress", "Completed", "Overdue"].map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <TriggerAssessmentModal vendors={vendors} />
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
              <TableHead>Questionnaire link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((assessment) => (
              <TableRow key={assessment.id}>
                <TableCell className="font-medium">
                  <VendorNameCell
                    name={assessment.vendors?.name}
                    contactEmail={assessment.vendors?.contact_email}
                  />
                </TableCell>
                <TableCell>
                  <AssessmentStatusBadge status={assessment.status} />
                </TableCell>
                <TableCell>{formatDateTime(assessment.launched_at)}</TableCell>
                <TableCell>{formatDateTime(assessment.completed_at)}</TableCell>
                <TableCell>
                  {assessment.risk_score !== null ? `${assessment.risk_score}/100` : "—"}
                </TableCell>
                <TableCell>
                  {assessment.status === "Completed" ? (
                    <span className="text-sm text-muted-foreground">Submitted</span>
                  ) : (
                    <CopyQuestionnaireLink token={assessment.questionnaire_token} />
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
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
