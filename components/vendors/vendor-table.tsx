"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RiskBadge, StatusBadge } from "@/components/shared/risk-badge";
import { VendorActions } from "@/components/vendors/vendor-actions";
import { VendorNameLink } from "@/components/vendors/vendor-name-link";
import { formatDate, getReviewStatus } from "@/lib/utils";
import type { Expert, Vendor } from "@/types";
import { cn } from "@/lib/utils";

export type VendorColumnFilters = {
  name: string;
  entity: string;
  type: string;
  contact: string;
  data: string;
  inherent: string;
  residual: string;
  status: string;
  lastReview: string;
  nextReview: string;
};

const EMPTY_FILTERS: VendorColumnFilters = {
  name: "",
  entity: "",
  type: "all",
  contact: "",
  data: "",
  inherent: "all",
  residual: "all",
  status: "all",
  lastReview: "",
  nextReview: "all",
};

const RISK_LEVELS = ["Low", "Medium", "High", "Very High"] as const;
const STATUS_OPTIONS = ["Active", "Offboarded", "Under Review"] as const;

function matchesRisk(value: string, filter: string) {
  if (filter === "all") return true;
  return value === filter || (filter === "Very High" && value === "Critical");
}

function filterVendors(vendors: Vendor[], filters: VendorColumnFilters) {
  return vendors.filter((v) => {
    if (filters.name && !v.name.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }
    if (filters.entity && !v.entity_name.toLowerCase().includes(filters.entity.toLowerCase())) {
      return false;
    }
    if (filters.type !== "all" && v.type !== filters.type) return false;

    if (filters.contact) {
      const q = filters.contact.toLowerCase();
      const match =
        v.datacontact_name.toLowerCase().includes(q) ||
        v.contact_email.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (filters.data) {
      const q = filters.data.toLowerCase();
      const match =
        v.data_type.toLowerCase().includes(q) ||
        v.data_classification.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (!matchesRisk(v.inherent_risk, filters.inherent)) return false;
    if (!matchesRisk(v.residual_risk, filters.residual)) return false;
    if (filters.status !== "all" && v.status !== filters.status) return false;

    if (filters.lastReview) {
      const label = formatDate(v.last_review_date).toLowerCase();
      if (!label.includes(filters.lastReview.toLowerCase())) return false;
    }

    if (filters.nextReview !== "all") {
      const reviewStatus = getReviewStatus(v.next_review_date);
      if (filters.nextReview === "overdue" && reviewStatus.variant !== "overdue") return false;
      if (filters.nextReview === "upcoming" && reviewStatus.variant !== "upcoming") return false;
      if (filters.nextReview === "none" && reviewStatus.variant !== "none") return false;
    }

    return true;
  });
}

interface VendorTableProps {
  vendors: Vendor[];
  experts?: Expert[];
  variant?: "compact" | "full";
  emptyMessage?: string;
  enableColumnFilters?: boolean;
  initialSearch?: string;
  onFilteredChange?: (count: number) => void;
  onFiltersActiveChange?: (active: boolean) => void;
  clearFiltersSignal?: number;
}

function ColumnTextFilter({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "Filter…"}
      className="h-8 px-2 text-xs"
      onClick={(e) => e.stopPropagation()}
    />
  );
}

function ColumnSelectFilter({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className="h-8 px-2 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function VendorTable({
  vendors,
  experts = [],
  variant = "compact",
  emptyMessage = "No vendors found.",
  enableColumnFilters = false,
  initialSearch = "",
  onFilteredChange,
  onFiltersActiveChange,
  clearFiltersSignal = 0,
}: VendorTableProps) {
  const isCompact = variant === "compact";
  const showFilters = !isCompact && enableColumnFilters;
  const colSpan = isCompact ? 6 : 11;

  const [filters, setFilters] = useState<VendorColumnFilters>(() => ({
    ...EMPTY_FILTERS,
    name: initialSearch,
  }));

  useEffect(() => {
    setFilters((prev) => ({ ...prev, name: initialSearch }));
  }, [initialSearch]);

  useEffect(() => {
    if (clearFiltersSignal > 0) {
      setFilters({ ...EMPTY_FILTERS });
    }
  }, [clearFiltersSignal]);

  const setFilter = <K extends keyof VendorColumnFilters>(key: K, value: VendorColumnFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const displayed = useMemo(
    () => (showFilters ? filterVendors(vendors, filters) : vendors),
    [vendors, filters, showFilters]
  );

  const filtersActive = useMemo(() => {
    return (
      filters.name !== "" ||
      filters.entity !== "" ||
      filters.type !== "all" ||
      filters.contact !== "" ||
      filters.data !== "" ||
      filters.inherent !== "all" ||
      filters.residual !== "all" ||
      filters.status !== "all" ||
      filters.lastReview !== "" ||
      filters.nextReview !== "all"
    );
  }, [filters]);

  useEffect(() => {
    onFilteredChange?.(displayed.length);
  }, [displayed.length, onFilteredChange]);

  useEffect(() => {
    onFiltersActiveChange?.(filtersActive);
  }, [filtersActive, onFiltersActiveChange]);

  const types = useMemo(
    () => Array.from(new Set(vendors.map((v) => v.type))).sort(),
    [vendors]
  );

  return (
    <Table>
      <TableHeader>
        <TableRow className={cn(isCompact && "hover:bg-transparent")}>
          <TableHead
            columnKey="vendor"
            className={cn(isCompact && "text-[11px] font-medium uppercase tracking-wider text-muted-foreground")}
          >
            Vendor
          </TableHead>
          <TableHead
            columnKey="entity"
            className={cn(isCompact && "text-[11px] font-medium uppercase tracking-wider text-muted-foreground")}
          >
            Entity
          </TableHead>
          {!isCompact && (
            <TableHead columnKey="type">Type</TableHead>
          )}
          {!isCompact && (
            <TableHead columnKey="contact">Contact</TableHead>
          )}
          {!isCompact && (
            <TableHead columnKey="data">Data</TableHead>
          )}
          <TableHead
            columnKey="inherent"
            className={cn(isCompact && "text-[11px] font-medium uppercase tracking-wider text-muted-foreground")}
          >
            Inherent
          </TableHead>
          <TableHead
            columnKey="residual"
            className={cn(isCompact && "text-[11px] font-medium uppercase tracking-wider text-muted-foreground")}
          >
            Residual
          </TableHead>
          {!isCompact && (
            <TableHead columnKey="status">Status</TableHead>
          )}
          <TableHead
            columnKey="lastReview"
            className={cn(isCompact && "text-[11px] font-medium uppercase tracking-wider text-muted-foreground")}
          >
            Last Review
          </TableHead>
          <TableHead
            columnKey="nextReview"
            className={cn(isCompact && "text-[11px] font-medium uppercase tracking-wider text-muted-foreground")}
          >
            Next Review
          </TableHead>
          {!isCompact && <TableHead columnKey="actions" resizable={false} className="w-10" />}
        </TableRow>
        {showFilters && (
          <TableRow className="hover:bg-transparent">
            <TableHead columnKey="vendor" resizable={false} className="pb-3 pt-0 font-normal">
              <ColumnTextFilter
                value={filters.name}
                onChange={(v) => setFilter("name", v)}
                placeholder="Name…"
              />
            </TableHead>
            <TableHead columnKey="entity" resizable={false} className="pb-3 pt-0 font-normal">
              <ColumnTextFilter
                value={filters.entity}
                onChange={(v) => setFilter("entity", v)}
                placeholder="Entity…"
              />
            </TableHead>
            <TableHead columnKey="type" resizable={false} className="pb-3 pt-0 font-normal">
              <ColumnSelectFilter
                value={filters.type}
                onChange={(v) => setFilter("type", v)}
                placeholder="Type"
                options={[
                  { value: "all", label: "All" },
                  ...types.map((t) => ({ value: t, label: t })),
                ]}
              />
            </TableHead>
            <TableHead columnKey="contact" resizable={false} className="pb-3 pt-0 font-normal">
              <ColumnTextFilter
                value={filters.contact}
                onChange={(v) => setFilter("contact", v)}
                placeholder="Contact…"
              />
            </TableHead>
            <TableHead columnKey="data" resizable={false} className="pb-3 pt-0 font-normal">
              <ColumnTextFilter
                value={filters.data}
                onChange={(v) => setFilter("data", v)}
                placeholder="Data…"
              />
            </TableHead>
            <TableHead columnKey="inherent" resizable={false} className="pb-3 pt-0 font-normal">
              <ColumnSelectFilter
                value={filters.inherent}
                onChange={(v) => setFilter("inherent", v)}
                placeholder="Inherent"
                options={[
                  { value: "all", label: "All" },
                  ...RISK_LEVELS.map((r) => ({ value: r, label: r })),
                ]}
              />
            </TableHead>
            <TableHead columnKey="residual" resizable={false} className="pb-3 pt-0 font-normal">
              <ColumnSelectFilter
                value={filters.residual}
                onChange={(v) => setFilter("residual", v)}
                placeholder="Residual"
                options={[
                  { value: "all", label: "All" },
                  ...RISK_LEVELS.map((r) => ({ value: r, label: r })),
                ]}
              />
            </TableHead>
            <TableHead columnKey="status" resizable={false} className="pb-3 pt-0 font-normal">
              <ColumnSelectFilter
                value={filters.status}
                onChange={(v) => setFilter("status", v)}
                placeholder="Status"
                options={[
                  { value: "all", label: "All" },
                  ...STATUS_OPTIONS.map((s) => ({ value: s, label: s })),
                ]}
              />
            </TableHead>
            <TableHead columnKey="lastReview" resizable={false} className="pb-3 pt-0 font-normal">
              <ColumnTextFilter
                value={filters.lastReview}
                onChange={(v) => setFilter("lastReview", v)}
                placeholder="Date…"
              />
            </TableHead>
            <TableHead columnKey="nextReview" resizable={false} className="pb-3 pt-0 font-normal">
              <ColumnSelectFilter
                value={filters.nextReview}
                onChange={(v) => setFilter("nextReview", v)}
                placeholder="Next"
                options={[
                  { value: "all", label: "All" },
                  { value: "overdue", label: "Overdue" },
                  { value: "upcoming", label: "Upcoming" },
                  { value: "none", label: "None" },
                ]}
              />
            </TableHead>
            <TableHead columnKey="actions" resizable={false} className="pb-3 pt-0" />
          </TableRow>
        )}
      </TableHeader>
      <TableBody>
        {displayed.map((vendor) => {
          const reviewStatus = getReviewStatus(vendor.next_review_date);
          return (
            <TableRow key={vendor.id}>
              <TableCell className={cn(!isCompact && "font-medium")}>
                <VendorNameLink
                  vendor={vendor}
                  size={isCompact ? "sm" : "md"}
                  showTypeBadge={isCompact}
                  experts={experts}
                />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{vendor.entity_name}</TableCell>
              {!isCompact && <TableCell>{vendor.type}</TableCell>}
              {!isCompact && (
                <TableCell>
                  <div className="text-sm">{vendor.datacontact_name}</div>
                  <div className="text-xs text-muted-foreground">{vendor.contact_email}</div>
                </TableCell>
              )}
              {!isCompact && (
                <TableCell>
                  <div className="text-sm">{vendor.data_type}</div>
                  <div className="text-xs text-muted-foreground">{vendor.data_classification}</div>
                </TableCell>
              )}
              <TableCell>
                <RiskBadge level={vendor.inherent_risk} />
              </TableCell>
              <TableCell>
                <RiskBadge level={vendor.residual_risk} />
              </TableCell>
              {!isCompact && (
                <TableCell>
                  <StatusBadge status={vendor.status} />
                </TableCell>
              )}
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(vendor.last_review_date)}
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "text-sm",
                    isCompact ? "font-semibold" : "font-medium",
                    reviewStatus.variant === "overdue" && "text-red-600",
                    reviewStatus.variant === "upcoming" && "text-green-600"
                  )}
                >
                  {reviewStatus.label}
                </span>
              </TableCell>
              {!isCompact && (
                <TableCell>
                  <VendorActions vendor={vendor} experts={experts} />
                </TableCell>
              )}
            </TableRow>
          );
        })}
        {displayed.length === 0 && (
          <TableRow>
            <TableCell colSpan={colSpan} className="py-8 text-center text-muted-foreground">
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
