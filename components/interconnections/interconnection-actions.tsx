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
import { InterconnectionEditSheet } from "@/components/interconnections/interconnection-edit-sheet";
import type { Interconnection } from "@/types";

interface InterconnectionActionsProps {
  interconnection: Interconnection;
}

export function InterconnectionActions({ interconnection }: InterconnectionActionsProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

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
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <InterconnectionEditSheet
        interconnection={interconnection}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
}
