"use client";

import { useMemo, useState } from "react";
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
  SEVERITY_LABELS,
  withAllOption,
} from "@/components/shared/column-filters";
import { RiskBadge } from "@/components/shared/risk-badge";
import { RemediationStatusSelect } from "@/components/remediations/status-select";
import { RemediationEvidenceDialog } from "@/components/remediations/remediation-evidence-dialog";
import {
  NewRemediationModal,
  type RemediationAssessmentOption,
} from "@/components/remediations/new-remediation-modal";
import { VendorNameCell } from "@/components/vendors/vendor-name-cell";
import { REMEDIATION_STATUS_LABELS, hasDocumentedEvidence } from "@/lib/remediation-status";
import { cn, formatDate, isPastDate } from "@/lib/utils";
import { differenceInCalendarDays, parseISO } from "date-fns";
import type { Vendor, Remediation } from "@/types";

interface RemediationsClientProps {
  items: Remediation[];
  vendors: Vendor[];
  assessments: RemediationAssessmentOption[];
  preselectedVendorId?: string;
  preselectedAssessmentId?: string;
}

type RemediationFilters = {
  vendor: string;
  title: string;
  priority: string;
  due: string;
  owner: string;
  evidence: string;
  status: string;
};

const EMPTY_FILTERS: RemediationFilters = {
  vendor: "",
  title: "",
  priority: "all",
  due: "all",
  owner: "",
  evidence: "all",
  status: "all",
};

const PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;
const STATUSES = ["Open", "In Progress", "Closed"] as const;

function matchesDue(rec: Remediation, filter: string) {
  if (filter === "all") return true;
  if (filter === "none") return !rec.due_date;
  if (!rec.due_date) return false;
  const open = rec.status !== "Closed";
  if (filter === "overdue") return open && isPastDate(rec.due_date);
  if (filter === "due30") {
    const days = differenceInCalendarDays(parseISO(rec.due_date.slice(0, 10)), new Date());
    return open && days >= 0 && days <= 30;
  }
  return true;
}

export function RemediationsClient({
  items,
  vendors,
  assessments,
  preselectedVendorId,
  preselectedAssessmentId,
}: RemediationsClientProps) {
  const [filters, setFilters] = useState<RemediationFilters>(EMPTY_FILTERS);

  const setFilter = <K extends keyof RemediationFilters>(key: K, value: RemediationFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const filtersActive = (Object.keys(filters) as (keyof RemediationFilters)[]).some(
    (key) => filters[key] !== EMPTY_FILTERS[key]
  );

  const filtered = useMemo(
    () =>
      items.filter((r) => {
        if (!includesText(r.vendors?.name, filters.vendor)) return false;
        if (
          filters.title &&
          !includesText(r.title, filters.title) &&
          !includesText(r.description, filters.title)
        ) {
          return false;
        }
        if (filters.priority !== "all" && r.priority !== filters.priority) return false;
        if (!matchesDue(r, filters.due)) return false;
        if (!includesText(r.owner, filters.owner)) return false;
        if (filters.evidence !== "all") {
          const documented = hasDocumentedEvidence(r.evidence);
          if ((filters.evidence === "documented") !== documented) return false;
        }
        if (filters.status !== "all" && r.status !== filters.status) return false;
        return true;
      }),
    [items, filters]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-3">
        {filtersActive && (
          <Button type="button" variant="outline" size="sm" onClick={() => setFilters(EMPTY_FILTERS)}>
            Clear filters
          </Button>
        )}
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
              <TableHead columnKey="vendor">Vendor</TableHead>
              <TableHead columnKey="title">Title</TableHead>
              <TableHead columnKey="priority">Priority</TableHead>
              <TableHead columnKey="due">Due Date</TableHead>
              <TableHead columnKey="owner">Owner</TableHead>
              <TableHead columnKey="evidence">Evidence</TableHead>
              <TableHead columnKey="status" className="text-right">
                Status
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
              <FilterHead columnKey="title">
                <ColumnTextFilter
                  value={filters.title}
                  onChange={(v) => setFilter("title", v)}
                  placeholder="Title…"
                />
              </FilterHead>
              <FilterHead columnKey="priority">
                <ColumnSelectFilter
                  value={filters.priority}
                  onChange={(v) => setFilter("priority", v)}
                  placeholder="Priority"
                  options={withAllOption(PRIORITIES, SEVERITY_LABELS)}
                />
              </FilterHead>
              <FilterHead columnKey="due">
                <ColumnSelectFilter
                  value={filters.due}
                  onChange={(v) => setFilter("due", v)}
                  placeholder="Due"
                  options={[
                    { value: "all", label: "All" },
                    { value: "overdue", label: "Overdue" },
                    { value: "due30", label: "Due in 30 days" },
                    { value: "none", label: "No due date" },
                  ]}
                />
              </FilterHead>
              <FilterHead columnKey="owner">
                <ColumnTextFilter
                  value={filters.owner}
                  onChange={(v) => setFilter("owner", v)}
                  placeholder="Owner…"
                />
              </FilterHead>
              <FilterHead columnKey="evidence">
                <ColumnSelectFilter
                  value={filters.evidence}
                  onChange={(v) => setFilter("evidence", v)}
                  placeholder="Evidence"
                  options={[
                    { value: "all", label: "All" },
                    { value: "documented", label: "Documented" },
                    { value: "missing", label: "Missing" },
                  ]}
                />
              </FilterHead>
              <FilterHead columnKey="status">
                <ColumnSelectFilter
                  value={filters.status}
                  onChange={(v) => setFilter("status", v)}
                  placeholder="Status"
                  options={withAllOption(STATUSES, REMEDIATION_STATUS_LABELS)}
                />
              </FilterHead>
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
                  {filtersActive ? "No remediations match your filters." : "No remediations found."}
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
