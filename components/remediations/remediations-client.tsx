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
import { RiskBadge } from "@/components/shared/risk-badge";
import { RemediationStatusSelect } from "@/components/remediations/status-select";
import { RemediationEvidenceDialog } from "@/components/remediations/remediation-evidence-dialog";
import {
  NewRemediationModal,
  type RemediationAssessmentOption,
} from "@/components/remediations/new-remediation-modal";
import { VendorNameCell } from "@/components/vendors/vendor-name-cell";
import { REMEDIATION_STATUS_LABELS } from "@/lib/remediation-status";
import { cn, formatDate, isPastDate } from "@/lib/utils";
import type { Vendor, Remediation, RemediationStatus } from "@/types";

interface RemediationsClientProps {
  items: Remediation[];
  vendors: Vendor[];
  assessments: RemediationAssessmentOption[];
  preselectedVendorId?: string;
  preselectedAssessmentId?: string;
}

export function RemediationsClient({
  items,
  vendors,
  assessments,
  preselectedVendorId,
  preselectedAssessmentId,
}: RemediationsClientProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filtered = items.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (priorityFilter !== "all" && r.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {(["Open", "In Progress", "Closed"] as RemediationStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {REMEDIATION_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              {["Low", "Medium", "High", "Critical"].map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <NewRemediationModal
          vendors={vendors}
          assessments={assessments}
          preselectedVendorId={preselectedVendorId}
          preselectedAssessmentId={preselectedAssessmentId}
        />
      </div>

      <div className="rounded-lg border border-border/80 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Evidence</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((rec) => {
              const overdue = rec.status !== "Closed" && isPastDate(rec.due_date);
              return (
                <TableRow key={rec.id}>
                  <TableCell>
                    <VendorNameCell
                      vendorId={rec.vendor_id}
                      name={rec.vendors?.name}
                      contactEmail={rec.vendors?.contact_email}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{rec.title}</div>
                    {rec.assessments && (
                      <div className="text-xs text-muted-foreground">
                        From assessment completed {formatDate(rec.assessments.completed_at)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell><RiskBadge level={rec.priority} /></TableCell>
                  <TableCell className={cn(overdue && "font-medium text-red-600")}>
                    {formatDate(rec.due_date)}
                    {overdue && <span className="ml-1 text-xs">(overdue)</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{rec.owner || "—"}</TableCell>
                  <TableCell>
                    <RemediationEvidenceDialog
                      id={rec.id}
                      title={rec.title}
                      evidence={rec.evidence}
                      status={rec.status}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <RemediationStatusSelect id={rec.id} status={rec.status} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No remediations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-muted-foreground">
        {filtered.length} of {items.length} remediations
      </p>
    </div>
  );
}
