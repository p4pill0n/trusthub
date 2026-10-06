"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { VendorNameCell } from "@/components/vendors/vendor-name-cell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InterconnectionDiagram } from "@/components/interconnections/interconnection-diagram";
import { InterconnectionActions } from "@/components/interconnections/interconnection-actions";
import { ArrowRight, ArrowLeft, ArrowLeftRight } from "lucide-react";
import type { ConnectionDirection, ConnectionType, Interconnection } from "@/types";

interface InterconnectionsClientProps {
  interconnections: Interconnection[];
}

const DIRECTIONS: ConnectionDirection[] = ["Inbound", "Outbound", "Bidirectional"];
const CONNECTION_TYPES: ConnectionType[] = ["API", "SFTP", "VPN", "Direct Link", "Portal"];

function DirectionIcon({ direction }: { direction: string }) {
  if (direction === "Inbound") return <ArrowLeft className="h-4 w-4 text-blue-600" />;
  if (direction === "Outbound") return <ArrowRight className="h-4 w-4 text-orange-600" />;
  return <ArrowLeftRight className="h-4 w-4 text-violet-600" />;
}

export function InterconnectionsClient({ interconnections }: InterconnectionsClientProps) {
  const [view, setView] = useState("table");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = interconnections.filter((ic) => {
    if (directionFilter !== "all" && ic.direction !== directionFilter) return false;
    if (typeFilter !== "all" && ic.connection_type !== typeFilter) return false;
    return true;
  });

  return (
    <Tabs value={view} onValueChange={setView}>
      <div className="flex flex-wrap items-center gap-3">
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="diagram">Diagram View</TabsTrigger>
        </TabsList>
        <Select value={directionFilter} onValueChange={setDirectionFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Directions</SelectItem>
            {DIRECTIONS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Connection type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Connection Types</SelectItem>
            {CONNECTION_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <TabsContent value="table" className="mt-4">
        <div className="rounded-lg border border-border/80 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Vendor data type</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Connection Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-10" resizable={false} />
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
                    No interconnections found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="diagram" className="mt-4">
        <InterconnectionDiagram interconnections={filtered} />
      </TabsContent>
    </Tabs>
  );
}
