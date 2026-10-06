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
import { updateVendorStatus } from "@/lib/actions";
import type { Expert, Vendor } from "@/types";

interface VendorActionsProps {
  vendor: Vendor;
  experts?: Expert[];
}

export function VendorActions({ vendor, experts = [] }: VendorActionsProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleOffboard() {
    startTransition(async () => {
      await updateVendorStatus(vendor.id, "Offboarded");
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setSheetOpen(true)}>
            <Eye className="mr-2 h-4 w-4" /> View
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleOffboard} disabled={isPending} className="text-red-600">
            <UserX className="mr-2 h-4 w-4" /> Offboard
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <VendorDetailSheet
        vendor={vendor}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        experts={experts}
      />
    </>
  );
}
