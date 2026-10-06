"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import type { Broadcast } from "@/types";
import { Mail } from "lucide-react";

interface ViewBroadcastMessageDialogProps {
  broadcast: Broadcast;
  trigger?: ReactNode;
}

export function ViewBroadcastMessageDialog({
  broadcast,
  trigger,
}: ViewBroadcastMessageDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" variant="outline" size="sm">
            <Mail className="h-4 w-4" />
            View message
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{broadcast.title}</DialogTitle>
          <DialogDescription>
            {broadcast.broadcast_type} · Sent {formatDate(broadcast.sent_at)}
            {broadcast.follow_up_due_date
              ? ` · Follow-up due ${formatDate(broadcast.follow_up_due_date)}`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border border-border/80 bg-neutral-50/80 px-4 py-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Message sent
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {broadcast.message || "No message content."}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
