"use client";

import { useMemo, useState, useTransition } from "react";
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
import { Button } from "@/components/ui/button";
import { VendorAvatar } from "@/components/vendors/vendor-avatar";
import { ViewBroadcastMessageDialog } from "@/components/broadcast/view-broadcast-message-dialog";
import { deleteBroadcast, updateBroadcastRecipientStatus } from "@/lib/actions";
import { cn, formatDate } from "@/lib/utils";
import type {
  Broadcast,
  BroadcastRecipient,
  BroadcastRecipientStatus,
} from "@/types";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface BroadcastFollowUpClientProps {
  broadcasts: Broadcast[];
  recipients: BroadcastRecipient[];
}

const STATUS_OPTIONS: BroadcastRecipientStatus[] = [
  "Compliant",
  "Not Compliant",
  "Ongoing",
];

function statusClass(status: BroadcastRecipientStatus) {
  switch (status) {
    case "Compliant":
      return "text-emerald-700";
    case "Not Compliant":
      return "text-red-600";
    case "Ongoing":
    default:
      return "text-amber-700";
  }
}

export function BroadcastFollowUpClient({
  broadcasts,
  recipients,
}: BroadcastFollowUpClientProps) {
  const router = useRouter();
  const [selectedBroadcastId, setSelectedBroadcastId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const campaignStats = useMemo(() => {
    const map = new Map<
      string,
      { total: number; compliant: number; notCompliant: number; ongoing: number }
    >();

    for (const recipient of recipients) {
      const current = map.get(recipient.broadcast_id) ?? {
        total: 0,
        compliant: 0,
        notCompliant: 0,
        ongoing: 0,
      };
      current.total += 1;
      if (recipient.status === "Compliant") current.compliant += 1;
      else if (recipient.status === "Not Compliant") current.notCompliant += 1;
      else current.ongoing += 1;
      map.set(recipient.broadcast_id, current);
    }

    return map;
  }, [recipients]);

  const selectedBroadcast = useMemo(
    () => broadcasts.find((b) => b.id === selectedBroadcastId) ?? null,
    [broadcasts, selectedBroadcastId]
  );

  const campaignRecipients = useMemo(() => {
    if (!selectedBroadcastId) return [];
    return recipients.filter((r) => r.broadcast_id === selectedBroadcastId);
  }, [recipients, selectedBroadcastId]);

  const filteredRecipients = useMemo(() => {
    if (statusFilter === "all") return campaignRecipients;
    return campaignRecipients.filter((r) => r.status === statusFilter);
  }, [campaignRecipients, statusFilter]);

  function handleStatusChange(id: string, status: BroadcastRecipientStatus) {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    startTransition(async () => {
      const result = await updateBroadcastRecipientStatus(id, status, notesDraft[id]);
      if (!result.ok) {
        setErrors((prev) => ({ ...prev, [id]: result.error }));
      }
    });
  }

  function handleNotesBlur(id: string, status: BroadcastRecipientStatus) {
    const notes = notesDraft[id];
    if (notes === undefined) return;
    startTransition(async () => {
      const result = await updateBroadcastRecipientStatus(id, status, notes);
      if (!result.ok) {
        setErrors((prev) => ({ ...prev, [id]: result.error }));
      }
    });
  }

  function handleDeleteBroadcast(id: string, title: string) {
    const confirmed = window.confirm(
      `Delete outreach “${title}”? This removes the campaign and all recipient follow-up records.`
    );
    if (!confirmed) return;

    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteBroadcast(id);
      if (!result.ok) {
        setDeleteError(result.error);
        return;
      }
      if (selectedBroadcastId === id) {
        setSelectedBroadcastId(null);
      }
      router.refresh();
    });
  }

  if (!selectedBroadcast) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {broadcasts.length} broadcast campaign{broadcasts.length === 1 ? "" : "s"}
          </p>
          {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
        </div>

        <div className="rounded-lg border border-border/80 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Broadcast campaign</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Follow-up due</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Compliant</TableHead>
                <TableHead>Not Compliant</TableHead>
                <TableHead>Ongoing</TableHead>
                <TableHead className="w-40" resizable={false} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {broadcasts.map((broadcast) => {
                const stats = campaignStats.get(broadcast.id) ?? {
                  total: broadcast.recipient_count ?? 0,
                  compliant: 0,
                  notCompliant: 0,
                  ongoing: 0,
                };
                return (
                  <TableRow
                    key={broadcast.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedBroadcastId(broadcast.id);
                      setStatusFilter("all");
                    }}
                  >
                    <TableCell>
                      <div className="font-medium text-foreground">{broadcast.title}</div>
                      <ViewBroadcastMessageDialog
                        broadcast={broadcast}
                        trigger={
                          <button
                            type="button"
                            className="mt-0.5 line-clamp-1 max-w-md text-left text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {broadcast.message || "View message"}
                          </button>
                        }
                      />
                    </TableCell>
                    <TableCell className="text-sm">{broadcast.broadcast_type}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(broadcast.sent_at)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(broadcast.follow_up_due_date)}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{stats.total}</TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-emerald-700">{stats.compliant}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-red-600">{stats.notCompliant}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-amber-700">{stats.ongoing}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBroadcastId(broadcast.id);
                            setStatusFilter("all");
                          }}
                        >
                          Open
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          disabled={isPending}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBroadcast(broadcast.id, broadcast.title);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {broadcasts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                    No broadcast campaigns yet. Create a broadcast to start follow-up tracking.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-2 h-8 px-2 text-muted-foreground"
            onClick={() => setSelectedBroadcastId(null)}
          >
            <ArrowLeft className="h-4 w-4" />
            All campaigns
          </Button>
          <div>
            <h2 className="font-serif text-lg font-normal tracking-tight text-foreground">
              {selectedBroadcast.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedBroadcast.broadcast_type} · Sent {formatDate(selectedBroadcast.sent_at)}
              {selectedBroadcast.follow_up_due_date
                ? ` · Follow-up due ${formatDate(selectedBroadcast.follow_up_due_date)}`
                : ""}
            </p>
            {deleteError && <p className="mt-2 text-sm text-red-600">{deleteError}</p>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ViewBroadcastMessageDialog broadcast={selectedBroadcast} />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All recipients</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            disabled={isPending}
            onClick={() =>
              handleDeleteBroadcast(selectedBroadcast.id, selectedBroadcast.title)
            }
          >
            <Trash2 className="h-4 w-4" />
            Delete outreach
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {filteredRecipients.length} of {campaignRecipients.length} recipients
      </p>

      <div className="rounded-lg border border-border/80 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Inherent risk</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecipients.map((recipient) => {
              const vendorName = recipient.vendors?.name ?? "Vendor";
              return (
                <TableRow key={recipient.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <VendorAvatar
                        name={vendorName}
                        contactEmail={recipient.vendors?.contact_email}
                        size="sm"
                      />
                      <div className="font-medium">{vendorName}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {recipient.vendors?.entity_name ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {recipient.vendors?.inherent_risk ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={recipient.status}
                      onValueChange={(value) =>
                        handleStatusChange(recipient.id, value as BroadcastRecipientStatus)
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger className={cn("h-9 w-44", statusClass(recipient.status))}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors[recipient.id] && (
                      <p className="mt-1 text-[11px] text-red-600">{errors[recipient.id]}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <input
                      value={notesDraft[recipient.id] ?? recipient.follow_up_notes ?? ""}
                      onChange={(e) =>
                        setNotesDraft((prev) => ({ ...prev, [recipient.id]: e.target.value }))
                      }
                      onBlur={() => handleNotesBlur(recipient.id, recipient.status)}
                      placeholder="Add follow-up note…"
                      className="h-9 w-full min-w-[180px] rounded-md border border-input bg-background px-3 text-sm"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredRecipients.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No recipients match this filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
