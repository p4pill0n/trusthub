"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddVendorModal } from "@/components/vendors/add-vendor-modal";
import { VendorTable } from "@/components/vendors/vendor-table";
import type { Vendor } from "@/types";
import { Search } from "lucide-react";

interface VendorsPageClientProps {
  vendors: Vendor[];
  initialSearch?: string;
}

export function VendorsPageClient({ vendors, initialSearch = "" }: VendorsPageClientProps) {
  const [search, setSearch] = useState(initialSearch);
  const [typeFilter, setTypeFilter] = useState("all");
  const [inherentFilter, setInherentFilter] = useState("all");
  const [residualFilter, setResidualFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  const filtered = useMemo(() => {
    return vendors.filter((v) => {
      if (search) {
        const q = search.toLowerCase();
        const match =
          v.name.toLowerCase().includes(q) ||
          v.entity_name.toLowerCase().includes(q) ||
          v.contact_email.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (typeFilter !== "all" && v.type !== typeFilter) return false;
      if (inherentFilter !== "all") {
        const matches =
          v.inherent_risk === inherentFilter ||
          (inherentFilter === "Very High" && (v.inherent_risk as string) === "Critical");
        if (!matches) return false;
      }
      if (residualFilter !== "all") {
        const matches =
          v.residual_risk === residualFilter ||
          (residualFilter === "Very High" && (v.residual_risk as string) === "Critical");
        if (!matches) return false;
      }
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      return true;
    });
  }, [vendors, search, typeFilter, inherentFilter, residualFilter, statusFilter]);

  const types = Array.from(new Set(vendors.map((v) => v.type)));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={inherentFilter} onValueChange={setInherentFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Inherent Risk" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Inherent</SelectItem>
            {["Low", "Medium", "High", "Very High"].map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={residualFilter} onValueChange={setResidualFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Residual Risk" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Residual</SelectItem>
            {["Low", "Medium", "High", "Very High"].map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {["Active", "Offboarded", "Under Review"].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        </div>
        <AddVendorModal />
      </div>

      <div className="rounded-lg border border-border/80 bg-white">
        <VendorTable
          vendors={filtered}
          variant="full"
          emptyMessage="No vendors match your filters."
        />
      </div>
      <p className="text-sm text-muted-foreground">{filtered.length} of {vendors.length} vendors</p>
    </div>
  );
}
