"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RankedFourthParty } from "@/types";

interface FourthPartiesClientProps {
  ranked: RankedFourthParty[];
}

export function FourthPartiesClient({ ranked }: FourthPartiesClientProps) {
  return (
    <div className="rounded-lg border border-border/80 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-14 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Rank
            </TableHead>
            <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Fourth-Party Name
            </TableHead>
            <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Occurrences
            </TableHead>
            <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Parent Vendors
            </TableHead>
            <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Service Description
            </TableHead>
            <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Country
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ranked.map((fp, index) => (
            <TableRow key={fp.name}>
              <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
              <TableCell className="font-medium">{fp.name}</TableCell>
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
          {ranked.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                No fourth parties recorded.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
