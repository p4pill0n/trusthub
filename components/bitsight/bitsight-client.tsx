"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VendorNameCell } from "@/components/vendors/vendor-name-cell";
import { getBitSightColor, formatDateTime } from "@/lib/utils";
import type { BitSightRatingRecord } from "@/types";

interface BitSightClientProps {
  ratings: BitSightRatingRecord[];
}

export function BitSightClient({ ratings }: BitSightClientProps) {
  return (
    <div className="rounded-lg border border-border/80 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vendor</TableHead>
            <TableHead>BitSight Score</TableHead>
            <TableHead>Rating Tier</TableHead>
            <TableHead>Last Fetched</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ratings.map((r) => {
            const color = getBitSightColor(r.score);
            const pct = (r.score / 900) * 100;
            return (
              <TableRow key={r.id}>
                <TableCell className="font-medium">
                  <VendorNameCell
                    name={r.vendors?.name}
                    contactEmail={r.vendors?.contact_email}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="w-10 font-semibold tabular-nums">{r.score}</span>
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{r.rating}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(r.fetched_at)}
                </TableCell>
              </TableRow>
            );
          })}
          {ratings.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                No BitSight ratings available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
