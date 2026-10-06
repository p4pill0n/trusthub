"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveInterconnections } from "@/lib/actions";
import type { ConnectionDirection, ConnectionType, Interconnection } from "@/types";

interface InterconnectionEditSheetProps {
  interconnection: Interconnection;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DIRECTIONS: ConnectionDirection[] = ["Inbound", "Outbound", "Bidirectional"];
const CONNECTION_TYPES: ConnectionType[] = ["API", "SFTP", "VPN", "Direct Link", "Portal"];

export function InterconnectionEditSheet({
  interconnection,
  open,
  onOpenChange,
}: InterconnectionEditSheetProps) {
  const router = useRouter();
  const [direction, setDirection] = useState(interconnection.direction);
  const [connectionType, setConnectionType] = useState(interconnection.connection_type);
  const [description, setDescription] = useState(interconnection.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setDirection(interconnection.direction);
    setConnectionType(interconnection.connection_type);
    setDescription(interconnection.description ?? "");
    setError(null);
  }, [open, interconnection]);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await saveInterconnections([
        {
          id: interconnection.id,
          direction,
          connection_type: connectionType,
          description,
        },
      ]);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Edit interconnection" onClose={() => onOpenChange(false)}>
        <div className="space-y-5">
          <div>
            <p className="text-sm text-muted-foreground">Vendor</p>
            <p className="font-medium">{interconnection.vendors?.name ?? "Vendor"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Data Type</p>
            <p className="font-medium">{interconnection.vendors?.data_type ?? "—"}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Direction</Label>
              <Select
                value={direction}
                onValueChange={(v) => setDirection(v as ConnectionDirection)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIRECTIONS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Connection Type</Label>
              <Select
                value={connectionType}
                onValueChange={(v) => setConnectionType(v as ConnectionType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONNECTION_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`ic-description-${interconnection.id}`}>Description</Label>
            <Input
              id={`ic-description-${interconnection.id}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description…"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 border-t border-border/80 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
