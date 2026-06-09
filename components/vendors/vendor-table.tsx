"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RiskBadge, StatusBadge } from "@/components/shared/risk-badge";
import { VendorActions } from "@/components/vendors/vendor-actions";
import { VendorAvatar } from "@/components/vendors/vendor-avatar";
import { formatDate, getReviewStatus } from "@/lib/utils";
import type { Vendor } from "@/types";
import { cn } from "@/lib/utils";

interface VendorTableProps {
  vendors: Vendor[];
  variant?: "compact" | "full";
  emptyMessage?: string;
}

export function VendorTable({
  vendors,
  variant = "compact",
  emptyMessage = "No vendors found.",
}: VendorTableProps) {
  const isCompact = variant === "compact";
  const colSpan = isCompact ? 6 : 11;

  return (
    <Table>
      <TableHeader>
        <TableRow className={cn(isCompact && "hover:bg-transparent")}>
          <TableHead className={cn(isCompact && "text-[11px] font-medium uppercase tracking-wider text-muted-foreground")}>
            Vendor
          </TableHead>
          <TableHead className={cn(isCompact && "text-[11px] font-medium uppercase tracking-wider text-muted-foreground")}>
            Entity
          </TableHead>
          {!isCompact && <TableHead>Type</TableHead>}
          {!isCompact && <TableHead>Contact</TableHead>}
          {!isCompact && <TableHead>Data</TableHead>}
          <TableHead className={cn(isCompact && "text-[11px] font-medium uppercase tracking-wider text-muted-foreground")}>
            Inherent
          </TableHead>
          <TableHead className={cn(isCompact && "text-[11px] font-medium uppercase tracking-wider text-muted-foreground")}>
            Residual
          </TableHead>
          {!isCompact && <TableHead>Status</TableHead>}
          <TableHead className={cn(isCompact && "text-[11px] font-medium uppercase tracking-wider text-muted-foreground")}>
            Last Review
          </TableHead>
          <TableHead className={cn(isCompact && "text-[11px] font-medium uppercase tracking-wider text-muted-foreground")}>
            Next Review
          </TableHead>
          {!isCompact && <TableHead className="w-10" />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {vendors.map((vendor) => {
          const reviewStatus = getReviewStatus(vendor.next_review_date);
          return (
            <TableRow key={vendor.id}>
              <TableCell className={cn(!isCompact && "font-medium")}>
                <div className="flex items-center gap-3">
                  <VendorAvatar
                    name={vendor.name}
                    contactEmail={vendor.contact_email}
                    size={isCompact ? "sm" : "md"}
                  />
                  <div>
                    <span className="font-medium text-foreground">{vendor.name}</span>
                    {isCompact && (
                      <div className="mt-1">
                        <span className="inline-block rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {vendor.type}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
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
                  <VendorActions vendor={vendor} />
                </TableCell>
              )}
            </TableRow>
          );
        })}
        {vendors.length === 0 && (
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
