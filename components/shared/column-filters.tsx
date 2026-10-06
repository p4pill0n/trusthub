"use client";

import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableHead } from "@/components/ui/table";

export type ColumnFilterOption = { value: string; label: string };

export function ColumnTextFilter({
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

export function ColumnSelectFilter({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: ColumnFilterOption[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 px-2 text-xs" onClick={(e) => e.stopPropagation()}>
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

/** Header cell for the filter row; `columnKey` must match the title cell above it. */
export function FilterHead({ columnKey, children }: { columnKey: string; children?: ReactNode }) {
  return (
    <TableHead columnKey={columnKey} resizable={false} className="pb-3 pt-0 font-normal">
      {children}
    </TableHead>
  );
}

export function withAllOption(values: readonly string[], labels?: Record<string, string>) {
  return [
    { value: "all", label: "All" },
    ...values.map((v) => ({ value: v, label: labels?.[v] ?? v })),
  ];
}

/** Matches how RiskBadge displays "Critical". */
export const SEVERITY_LABELS: Record<string, string> = { Critical: "Very High" };

export function includesText(haystack: string | null | undefined, needle: string) {
  if (!needle) return true;
  return (haystack ?? "").toLowerCase().includes(needle.trim().toLowerCase());
}
