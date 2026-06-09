"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddVendorForm } from "@/components/vendors/add-vendor-form";
import { UserPlus } from "lucide-react";

export function AddVendorModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4" />
          Add Vendors
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Vendors</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Add a new vendor directly to the vendor register.
          </p>
        </DialogHeader>
        <AddVendorForm idPrefix="add-vendor" onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
