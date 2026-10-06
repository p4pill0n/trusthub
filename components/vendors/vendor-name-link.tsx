"use client";

import { useState } from "react";
import { VendorAvatar } from "@/components/vendors/vendor-avatar";
import { VendorDetailSheet } from "@/components/vendors/vendor-detail-sheet";
import { cn } from "@/lib/utils";
import type { Expert, Vendor } from "@/types";

interface VendorNameLinkProps {
  vendor: Vendor;
  size?: "sm" | "md";
  showTypeBadge?: boolean;
  className?: string;
  experts?: Expert[];
}

export function VendorNameLink({
  vendor,
  size = "md",
  showTypeBadge = false,
  className,
  experts = [],
}: VendorNameLinkProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex w-full items-center gap-3 rounded-md text-left transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
      >
        <VendorAvatar name={vendor.name} contactEmail={vendor.contact_email} size={size} />
        <div className="min-w-0">
          <span className="font-medium text-foreground underline-offset-4 hover:underline">
            {vendor.name}
          </span>
          {showTypeBadge && (
            <div className="mt-1">
              <span className="inline-block rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {vendor.type}
              </span>
            </div>
          )}
        </div>
      </button>
      <VendorDetailSheet
        vendor={vendor}
        open={open}
        onOpenChange={setOpen}
        experts={experts}
      />
    </>
  );
}
