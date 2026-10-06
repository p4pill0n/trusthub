"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { AddVendorModal } from "@/components/vendors/add-vendor-modal";
import { VendorTable } from "@/components/vendors/vendor-table";
import type { Expert, Vendor } from "@/types";

interface VendorsPageClientProps {
  vendors: Vendor[];
  experts?: Expert[];
  initialSearch?: string;
}

export function VendorsPageClient({
  vendors,
  experts = [],
  initialSearch = "",
}: VendorsPageClientProps) {
  const [filteredCount, setFilteredCount] = useState(vendors.length);
  const [filtersActive, setFiltersActive] = useState(Boolean(initialSearch));
  const [clearSignal, setClearSignal] = useState(0);

  const handleFilteredChange = useCallback((count: number) => {
    setFilteredCount(count);
  }, []);

  const handleFiltersActiveChange = useCallback((active: boolean) => {
    setFiltersActive(active);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-3">
        {filtersActive && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setClearSignal((n) => n + 1)}
          >
            Clear filters
          </Button>
        )}
        <AddVendorModal />
      </div>

      <div className="rounded-lg border border-border/80 bg-white">
        <VendorTable
          vendors={vendors}
          experts={experts}
          variant="full"
          enableColumnFilters
          initialSearch={initialSearch}
          clearFiltersSignal={clearSignal}
          onFilteredChange={handleFilteredChange}
          onFiltersActiveChange={handleFiltersActiveChange}
          emptyMessage="No vendors match your filters."
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {filteredCount} of {vendors.length} vendors
      </p>
    </div>
  );
}
