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
  ColumnTextFilter,
  FilterHead,
  includesText,
} from "@/components/shared/column-filters";
import { VendorAvatar } from "@/components/vendors/vendor-avatar";
import type { RankedFourthParty } from "@/types";

interface FourthPartiesClientProps {
  ranked: RankedFourthParty[];
}

type FourthPartyFilters = {
  rank: string;
  name: string;
  occurrences: string;
  parents: string;
  service: string;
  country: string;
};

const EMPTY_FILTERS: FourthPartyFilters = {
  rank: "",
  name: "",
  occurrences: "",
  parents: "",
  service: "",
  country: "",
};

export function FourthPartiesClient({ ranked }: FourthPartiesClientProps) {
  const [filters, setFilters] = useState<FourthPartyFilters>(EMPTY_FILTERS);

  const setFilter = <K extends keyof FourthPartyFilters>(key: K, value: FourthPartyFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const filtersActive = (Object.keys(filters) as (keyof FourthPartyFilters)[]).some(
    (key) => filters[key] !== EMPTY_FILTERS[key]
  );

  const filtered = useMemo(
    () =>
      ranked
        .map((fp, index) => ({ fp, rank: index + 1 }))
        .filter(({ fp, rank }) => {
          if (filters.rank && !String(rank).includes(filters.rank.trim())) return false;
          if (!includesText(fp.name, filters.name)) return false;
          if (filters.occurrences && !String(fp.count).includes(filters.occurrences.trim())) {
            return false;
          }
          if (!includesText(fp.parentVendors.join(", "), filters.parents)) return false;
          if (!includesText(fp.serviceDescriptions.join(" · "), filters.service)) return false;
          if (!includesText(fp.countries.join(", "), filters.country)) return false;
          return true;
        }),
    [ranked, filters]
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
            <TableRow className="hover:bg-transparent">
              <TableHead
                columnKey="rank"
                className="w-14 text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
              >
                Rank
              </TableHead>
              <TableHead
                columnKey="name"
                className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
              >
                Fourth-Party Name
              </TableHead>
              <TableHead
                columnKey="occurrences"
                className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
              >
                Occurrences
              </TableHead>
              <TableHead
                columnKey="parents"
                className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
              >
                Parent Vendors
              </TableHead>
              <TableHead
                columnKey="service"
                className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
              >
                Service Description
              </TableHead>
              <TableHead
                columnKey="country"
                className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
              >
                Country
              </TableHead>
            </TableRow>
            <TableRow className="hover:bg-transparent">
              <FilterHead columnKey="rank">
                <ColumnTextFilter
                  value={filters.rank}
                  onChange={(v) => setFilter("rank", v)}
                  placeholder="#"
                />
              </FilterHead>
              <FilterHead columnKey="name">
                <ColumnTextFilter
                  value={filters.name}
                  onChange={(v) => setFilter("name", v)}
                  placeholder="Name…"
                />
              </FilterHead>
              <FilterHead columnKey="occurrences">
                <ColumnTextFilter
                  value={filters.occurrences}
                  onChange={(v) => setFilter("occurrences", v)}
                  placeholder="Count…"
                />
              </FilterHead>
              <FilterHead columnKey="parents">
                <ColumnTextFilter
                  value={filters.parents}
                  onChange={(v) => setFilter("parents", v)}
                  placeholder="Parent…"
                />
              </FilterHead>
              <FilterHead columnKey="service">
                <ColumnTextFilter
                  value={filters.service}
                  onChange={(v) => setFilter("service", v)}
                  placeholder="Service…"
                />
              </FilterHead>
              <FilterHead columnKey="country">
                <ColumnTextFilter
                  value={filters.country}
                  onChange={(v) => setFilter("country", v)}
                  placeholder="Country…"
                />
              </FilterHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(({ fp, rank }) => (
              <TableRow key={fp.name}>
                <TableCell className="font-medium text-muted-foreground">{rank}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <VendorAvatar name={fp.name} size="sm" />
                    <span className="font-medium text-foreground">{fp.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex min-w-[1.75rem] items-center justify-center rounded-full bg-neutral-100 px-2 py-0.5 text-sm font-semibold">
                    {fp.count}
                  </span>
                </TableCell>
                <TableCell className="max-w-xs text-sm text-muted-foreground">
                  {fp.parentVendors.join(", ")}
                </TableCell>
                <TableCell className="max-w-sm text-sm text-muted-foreground">
                  {fp.serviceDescriptions.join(" · ")}
                </TableCell>
                <TableCell className="text-sm">{fp.countries.join(", ") || "—"}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  No fourth parties found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-muted-foreground">
        {filtered.length} of {ranked.length} fourth parties
      </p>
    </div>
  );
}
