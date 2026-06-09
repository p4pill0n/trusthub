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
import { RiskBadge, StatusBadge } from "@/components/shared/risk-badge";
import { VendorNameCell } from "@/components/vendors/vendor-name-cell";
import { formatDateTime } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Fragment } from "react";
import type { SecurityIncident } from "@/types";

interface IncidentsClientProps {
  incidents: SecurityIncident[];
}

export function IncidentsClient({ incidents }: IncidentsClientProps) {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = incidents.filter((i) => {
    if (severityFilter !== "all" && i.severity !== severityFilter) return false;
    if (statusFilter !== "all" && i.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            {["Low", "Medium", "High", "Critical"].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {["Open", "Resolved"].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border/80 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Vendor</TableHead>
              <TableHead>Incident Title</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Detected At</TableHead>
              <TableHead>Resolved At</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((incident) => (
              <Fragment key={incident.id}>
                <TableRow
                  className="cursor-pointer"
                  onClick={() =>
                    setExpandedId(expandedId === incident.id ? null : incident.id)
                  }
                >
                  <TableCell>
                    {expandedId === incident.id ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    <VendorNameCell
                      name={incident.vendors?.name}
                      contactEmail={incident.vendors?.contact_email}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{incident.title}</TableCell>
                  <TableCell><RiskBadge level={incident.severity} /></TableCell>
                  <TableCell>{formatDateTime(incident.detected_at)}</TableCell>
                  <TableCell>{formatDateTime(incident.resolved_at)}</TableCell>
                  <TableCell><StatusBadge status={incident.status} /></TableCell>
                </TableRow>
                {expandedId === incident.id && (
                  <TableRow>
                    <TableCell colSpan={7} className="bg-muted/30">
                      <p className="text-sm text-muted-foreground">
                        {incident.description ?? "No description available."}
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No incidents found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
