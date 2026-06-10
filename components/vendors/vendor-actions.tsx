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
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { RiskBadge, StatusBadge } from "@/components/shared/risk-badge";
import { VendorAvatar } from "@/components/vendors/vendor-avatar";
import { updateVendorStatus } from "@/lib/actions";
import { formatDate } from "@/lib/utils";
import type { Vendor } from "@/types";

interface VendorActionsProps {
  vendor: Vendor;
}

export function VendorActions({ vendor }: VendorActionsProps) {
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

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent title={vendor.name} onClose={() => setSheetOpen(false)}>
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border/80 pb-4">
              <VendorAvatar name={vendor.name} contactEmail={vendor.contact_email} />
              <div>
                <p className="font-medium">{vendor.name}</p>
                <p className="text-sm text-muted-foreground">{vendor.type}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Entity</p>
              <p className="font-medium">{vendor.entity_name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p>{vendor.type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={vendor.status} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data Type</p>
                <p>{vendor.data_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Classification</p>
                <p>{vendor.data_classification}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact</p>
              <p>{vendor.datacontact_name}</p>
              <p className="text-sm text-muted-foreground">{vendor.contact_email}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Inherent Risk</p>
                <RiskBadge level={vendor.inherent_risk} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Residual Risk</p>
                <RiskBadge level={vendor.residual_risk} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Last Review</p>
                <p>{formatDate(vendor.last_review_date)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Review</p>
                <p>{formatDate(vendor.next_review_date)}</p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
