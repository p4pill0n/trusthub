"use client";

import { useState, useTransition } from "react";
import { VendorAvatar } from "@/components/vendors/vendor-avatar";
import { VendorDetailSheet } from "@/components/vendors/vendor-detail-sheet";
import { loadVendorProfile } from "@/lib/actions";
import type { Expert, Vendor } from "@/types";

interface VendorNameCellProps {
  vendorId?: string | null;
  name?: string | null;
  contactEmail?: string | null;
}

/** Vendor name for related-record tables; opens the vendor sheet on demand. */
export function VendorNameCell({ vendorId, name, contactEmail }: VendorNameCellProps) {
  const [profile, setProfile] = useState<{ vendor: Vendor; experts: Expert[] } | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!name) return <>—</>;

  const content = (
    <>
      <VendorAvatar name={name} contactEmail={contactEmail} size="sm" />
      <span className="underline-offset-4 group-hover:underline">{name}</span>
    </>
  );

  if (!vendorId) {
    return <div className="flex items-center gap-3">{content}</div>;
  }

  function handleOpen(e: React.MouseEvent) {
    e.stopPropagation();
    setError(null);
    if (profile) {
      setOpen(true);
      return;
    }
    startTransition(async () => {
      const result = await loadVendorProfile(vendorId as string);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setProfile({ vendor: result.vendor, experts: result.experts });
      setOpen(true);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        disabled={isPending}
        className="group flex items-center gap-3 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
      >
        {content}
      </button>
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
      {profile && (
        <div onClick={(e) => e.stopPropagation()}>
          <VendorDetailSheet
            vendor={profile.vendor}
            experts={profile.experts}
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              if (!next) setProfile(null);
            }}
          />
        </div>
      )}
    </>
  );
}
