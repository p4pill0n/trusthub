"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddVendorForm } from "@/components/vendors/add-vendor-form";
import { ClipboardList, UserPlus } from "lucide-react";

export function AddVendorModal() {
  const [open, setOpen] = useState(false);
  const [createdVendorId, setCreatedVendorId] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setCreatedVendorId(null);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4" />
          Add Vendor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Vendor</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Add a new vendor directly to the vendor register.
          </p>
        </DialogHeader>
        {createdVendorId ? (
          <>
            <p className="text-sm text-emerald-700">
              Vendor added. Trigger its first risk assessment to start the review cycle.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Done
              </Button>
              <Button asChild>
                <Link href={`/risk-assessment?vendor=${createdVendorId}`}>
                  <ClipboardList className="h-4 w-4" />
                  Trigger assessment
                </Link>
              </Button>
            </DialogFooter>
          </>
        ) : (
          <AddVendorForm idPrefix="add-vendor" onSuccess={setCreatedVendorId} />
        )}
      </DialogContent>
    </Dialog>
  );
}
