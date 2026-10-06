"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, Eye, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VendorDetailSheet } from "@/components/vendors/vendor-detail-sheet";
import { offboardVendor } from "@/lib/actions";
import type { Expert, Vendor } from "@/types";

interface VendorActionsProps {
  vendor: Vendor;
  experts?: Expert[];
}

export function VendorActions({ vendor, experts = [] }: VendorActionsProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOffboard() {
    const confirmed = window.confirm(
      `Offboard ${vendor.name}? It will be removed from review tracking, the dashboard, and new assessments, remediations and broadcasts. Open questionnaire links will stop accepting responses. History is kept.`
    );
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      try {
        const result = await offboardVendor(vendor.id);
        if (!result.ok) setError(result.error);
      } catch {
        setError("Failed to offboard vendor.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${vendor.name}`}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setSheetOpen(true)}>
            <Eye className="mr-2 h-4 w-4" /> View
          </DropdownMenuItem>
          {vendor.status !== "Offboarded" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleOffboard}
                disabled={isPending}
                className="text-red-600"
              >
                <UserX className="mr-2 h-4 w-4" /> Offboard
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {error && <p className="max-w-[12rem] text-right text-[11px] text-red-600">{error}</p>}

      <VendorDetailSheet
        vendor={vendor}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        experts={experts}
      />
    </div>
  );
}
