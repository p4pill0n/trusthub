"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IncidentEditSheet } from "@/components/incidents/incident-edit-sheet";
import type { SecurityIncident } from "@/types";

interface IncidentActionsProps {
  incident: SecurityIncident;
}

export function IncidentActions({ incident }: IncidentActionsProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={() => setSheetOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <IncidentEditSheet incident={incident} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
