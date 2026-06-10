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
import { NewRemediationModal } from "@/components/remediations/new-remediation-modal";
import { VendorNameCell } from "@/components/vendors/vendor-name-cell";
import { REMEDIATION_STATUS_LABELS } from "@/lib/remediation-status";
import { formatDate } from "@/lib/utils";
import type { Vendor, Remediation, RemediationStatus } from "@/types";

interface RemediationsClientProps {
  items: (Remediation & { vendors: { name: string; contact_email?: string } | null })[];
  vendors: Vendor[];
}

export function RemediationsClient({ items, vendors }: RemediationsClientProps) {
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
        <NewRemediationModal vendors={vendors} />
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
            {filtered.map((rec) => (
              <TableRow key={rec.id}>
                <TableCell>
                  <VendorNameCell
                    name={rec.vendors?.name}
                    contactEmail={rec.vendors?.contact_email}
                  />
                </TableCell>
                <TableCell className="font-medium">{rec.title}</TableCell>
                <TableCell><RiskBadge level={rec.priority} /></TableCell>
                <TableCell>{formatDate(rec.due_date)}</TableCell>
                <TableCell className="text-muted-foreground">{rec.owner ?? "—"}</TableCell>
                <TableCell>
                  <RemediationEvidenceDialog title={rec.title} evidence={rec.evidence} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <RemediationStatusSelect id={rec.id} status={rec.status} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
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
    </div>
  );
}
