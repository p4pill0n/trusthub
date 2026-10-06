"use client";

import { Fragment, useMemo, useState } from "react";
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
import { RiskBadge, StatusBadge } from "@/components/shared/risk-badge";
import { VendorNameCell } from "@/components/vendors/vendor-name-cell";
import { IncidentActions } from "@/components/incidents/incident-actions";
import { INCIDENT_SEVERITIES, INCIDENT_STATUSES } from "@/components/incidents/incident-form-fields";
import { formatDateTime } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { SecurityIncident } from "@/types";

interface IncidentsClientProps {
  incidents: SecurityIncident[];
  initialStatus?: string;
}

type IncidentFilters = {
  vendor: string;
  title: string;
  severity: string;
  detected: string;
  resolved: string;
  status: string;
};

const EMPTY_FILTERS: IncidentFilters = {
  vendor: "",
  title: "",
  severity: "all",
  detected: "",
  resolved: "",
  status: "all",
};

export function IncidentsClient({ incidents, initialStatus = "all" }: IncidentsClientProps) {
  const [filters, setFilters] = useState<IncidentFilters>(() => ({
    ...EMPTY_FILTERS,
    status: initialStatus,
  }));
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const setFilter = <K extends keyof IncidentFilters>(key: K, value: IncidentFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const filtersActive = (Object.keys(filters) as (keyof IncidentFilters)[]).some(
    (key) => filters[key] !== EMPTY_FILTERS[key]
  );

  const filtered = useMemo(
    () =>
      incidents.filter((i) => {
        if (!includesText(i.vendors?.name, filters.vendor)) return false;
        if (
          filters.title &&
          !includesText(i.title, filters.title) &&
          !includesText(i.description, filters.title)
        ) {
          return false;
        }
        if (filters.severity !== "all" && i.severity !== filters.severity) return false;
        if (!includesText(formatDateTime(i.detected_at), filters.detected)) return false;
        if (!includesText(formatDateTime(i.resolved_at), filters.resolved)) return false;
        if (filters.status !== "all" && i.status !== filters.status) return false;
        return true;
      }),
    [incidents, filters]
  );

  return (
    <div className="space-y-4">
      {filtersActive && (
        <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={() => setFilters(EMPTY_FILTERS)}>
            Clear filters
          </Button>
        </div>
      )}

      <div className="rounded-lg border border-border/80 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead columnKey="expand" className="w-8" resizable={false} />
              <TableHead columnKey="vendor">Vendor</TableHead>
              <TableHead columnKey="title">Incident Title</TableHead>
              <TableHead columnKey="severity">Severity</TableHead>
              <TableHead columnKey="detected">Detected At</TableHead>
              <TableHead columnKey="resolved">Resolved At</TableHead>
              <TableHead columnKey="status">Status</TableHead>
              <TableHead columnKey="actions" className="w-10" resizable={false} />
            </TableRow>
            <TableRow className="hover:bg-transparent">
              <FilterHead columnKey="expand" />
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
              <FilterHead columnKey="severity">
                <ColumnSelectFilter
                  value={filters.severity}
                  onChange={(v) => setFilter("severity", v)}
                  placeholder="Severity"
                  options={withAllOption(INCIDENT_SEVERITIES, SEVERITY_LABELS)}
                />
              </FilterHead>
              <FilterHead columnKey="detected">
                <ColumnTextFilter
                  value={filters.detected}
                  onChange={(v) => setFilter("detected", v)}
                  placeholder="Date…"
                />
              </FilterHead>
              <FilterHead columnKey="resolved">
                <ColumnTextFilter
                  value={filters.resolved}
                  onChange={(v) => setFilter("resolved", v)}
                  placeholder="Date…"
                />
              </FilterHead>
              <FilterHead columnKey="status">
                <ColumnSelectFilter
                  value={filters.status}
                  onChange={(v) => setFilter("status", v)}
                  placeholder="Status"
                  options={withAllOption(INCIDENT_STATUSES)}
                />
              </FilterHead>
              <FilterHead columnKey="actions" />
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
                      vendorId={incident.vendor_id}
                      name={incident.vendors?.name}
                      contactEmail={incident.vendors?.contact_email}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{incident.title}</TableCell>
                  <TableCell>
                    <RiskBadge level={incident.severity} />
                  </TableCell>
                  <TableCell>{formatDateTime(incident.detected_at)}</TableCell>
                  <TableCell>{formatDateTime(incident.resolved_at)}</TableCell>
                  <TableCell>
                    <StatusBadge status={incident.status} />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <IncidentActions incident={incident} />
                  </TableCell>
                </TableRow>
                {expandedId === incident.id && (
                  <TableRow>
                    <TableCell colSpan={8} className="bg-muted/30">
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
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  {filtersActive ? "No incidents match your filters." : "No incidents found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-muted-foreground">
        {filtered.length} of {incidents.length} incidents
      </p>
    </div>
  );
}
