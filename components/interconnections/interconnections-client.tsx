"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VendorNameCell } from "@/components/vendors/vendor-name-cell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnSelectFilter,
  ColumnTextFilter,
  FilterHead,
  includesText,
  withAllOption,
} from "@/components/shared/column-filters";
import { InterconnectionDiagram } from "@/components/interconnections/interconnection-diagram";
import { InterconnectionActions } from "@/components/interconnections/interconnection-actions";
import { DATA_TYPES } from "@/lib/constants";
import { ArrowRight, ArrowLeft, ArrowLeftRight } from "lucide-react";
import type { ConnectionDirection, ConnectionType, Interconnection } from "@/types";

interface InterconnectionsClientProps {
  interconnections: Interconnection[];
}

type InterconnectionFilters = {
  vendor: string;
  dataType: string;
  direction: string;
  connectionType: string;
  description: string;
};

const EMPTY_FILTERS: InterconnectionFilters = {
  vendor: "",
  dataType: "all",
  direction: "all",
  connectionType: "all",
  description: "",
};

const DIRECTIONS: ConnectionDirection[] = ["Inbound", "Outbound", "Bidirectional"];
const CONNECTION_TYPES: ConnectionType[] = ["API", "SFTP", "VPN", "Direct Link", "Portal"];

function DirectionIcon({ direction }: { direction: string }) {
  if (direction === "Inbound") return <ArrowLeft className="h-4 w-4 text-blue-600" />;
  if (direction === "Outbound") return <ArrowRight className="h-4 w-4 text-orange-600" />;
  return <ArrowLeftRight className="h-4 w-4 text-violet-600" />;
}

export function InterconnectionsClient({ interconnections }: InterconnectionsClientProps) {
  const [view, setView] = useState("table");
  const [filters, setFilters] = useState<InterconnectionFilters>(EMPTY_FILTERS);

  const setFilter = <K extends keyof InterconnectionFilters>(
    key: K,
    value: InterconnectionFilters[K]
  ) => setFilters((prev) => ({ ...prev, [key]: value }));

  const filtersActive = (Object.keys(filters) as (keyof InterconnectionFilters)[]).some(
    (key) => filters[key] !== EMPTY_FILTERS[key]
  );

  const filtered = useMemo(
    () =>
      interconnections.filter((ic) => {
        if (!includesText(ic.vendors?.name, filters.vendor)) return false;
        if (filters.dataType !== "all" && ic.vendors?.data_type !== filters.dataType) return false;
        if (filters.direction !== "all" && ic.direction !== filters.direction) return false;
        if (filters.connectionType !== "all" && ic.connection_type !== filters.connectionType) {
          return false;
        }
        if (!includesText(ic.description, filters.description)) return false;
        return true;
      }),
    [interconnections, filters]
  );

  return (
    <Tabs value={view} onValueChange={setView}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="diagram">Diagram View</TabsTrigger>
        </TabsList>
        {filtersActive && (
          <Button type="button" variant="outline" size="sm" onClick={() => setFilters(EMPTY_FILTERS)}>
            Clear filters
          </Button>
        )}
      </div>

      <TabsContent value="table" className="mt-4 space-y-4">
        <div className="rounded-lg border border-border/80 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead columnKey="vendor">Vendor</TableHead>
                <TableHead columnKey="dataType">Vendor data type</TableHead>
                <TableHead columnKey="direction">Direction</TableHead>
                <TableHead columnKey="connectionType">Connection Type</TableHead>
                <TableHead columnKey="description">Description</TableHead>
                <TableHead columnKey="actions" className="w-10" resizable={false} />
              </TableRow>
              <TableRow className="hover:bg-transparent">
                <FilterHead columnKey="vendor">
                  <ColumnTextFilter
                    value={filters.vendor}
                    onChange={(v) => setFilter("vendor", v)}
                    placeholder="Vendor…"
                  />
                </FilterHead>
                <FilterHead columnKey="dataType">
                  <ColumnSelectFilter
                    value={filters.dataType}
                    onChange={(v) => setFilter("dataType", v)}
                    placeholder="Data type"
                    options={withAllOption(DATA_TYPES)}
                  />
                </FilterHead>
                <FilterHead columnKey="direction">
                  <ColumnSelectFilter
                    value={filters.direction}
                    onChange={(v) => setFilter("direction", v)}
                    placeholder="Direction"
                    options={withAllOption(DIRECTIONS)}
                  />
                </FilterHead>
                <FilterHead columnKey="connectionType">
                  <ColumnSelectFilter
                    value={filters.connectionType}
                    onChange={(v) => setFilter("connectionType", v)}
                    placeholder="Type"
                    options={withAllOption(CONNECTION_TYPES)}
                  />
                </FilterHead>
                <FilterHead columnKey="description">
                  <ColumnTextFilter
                    value={filters.description}
                    onChange={(v) => setFilter("description", v)}
                    placeholder="Description…"
                  />
                </FilterHead>
                <FilterHead columnKey="actions" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((ic) => (
                <TableRow key={ic.id}>
                  <TableCell className="font-medium">
                    <VendorNameCell
                      vendorId={ic.vendor_id}
                      name={ic.vendors?.name}
                      contactEmail={ic.vendors?.contact_email}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{ic.vendors?.data_type ?? "—"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DirectionIcon direction={ic.direction} />
                      <span className="text-sm">{ic.direction}</span>
                    </div>
                  </TableCell>
                  <TableCell>{ic.connection_type}</TableCell>
                  <TableCell className="max-w-xs text-sm text-muted-foreground">
                    {ic.description}
                  </TableCell>
                  <TableCell>
                    <InterconnectionActions interconnection={ic} />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    {filtersActive
                      ? "No interconnections match your filters."
                      : "No interconnections found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <p className="text-sm text-muted-foreground">
          {filtered.length} of {interconnections.length} interconnections
        </p>
      </TabsContent>

      <TabsContent value="diagram" className="mt-4">
        <InterconnectionDiagram interconnections={filtered} />
      </TabsContent>
    </Tabs>
  );
}
