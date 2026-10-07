"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createBroadcast } from "@/lib/actions";
import type {
  BroadcastAudience,
  BroadcastType,
  InherentRisk,
  Vendor,
} from "@/types";
import Link from "next/link";
import { Mail, Megaphone } from "lucide-react";

interface CreateBroadcastClientProps {
  vendors: Vendor[];
}

const BROADCAST_TYPES: BroadcastType[] = [
  "General",
  "Policy update",
  "Major vulnerability",
  "Incident notice",
];

const AUDIENCES: BroadcastAudience[] = [
  "All active vendors",
  "By inherent risk",
  "Selected vendors",
];

const RISK_LEVELS: InherentRisk[] = ["Low", "Medium", "High", "Very High"];

export function CreateBroadcastClient({ vendors }: CreateBroadcastClientProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [broadcastType, setBroadcastType] = useState<BroadcastType>("General");
  const [audience, setAudience] = useState<BroadcastAudience>("All active vendors");
  const [audienceRisk, setAudienceRisk] = useState<InherentRisk>("High");
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [followUpDueDate, setFollowUpDueDate] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    recipientCount: number;
    mailtoHref: string | null;
  } | null>(null);

  const audienceCount = useMemo(() => {
    if (audience === "All active vendors") return vendors.length;
    if (audience === "By inherent risk") {
      return vendors.filter((v) => v.inherent_risk === audienceRisk).length;
    }
    return selectedVendorIds.length;
  }, [audience, audienceRisk, selectedVendorIds, vendors]);

  function toggleVendor(id: string) {
    setSelectedVendorIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
    setSuccess(null);
  }

  function handleSubmit() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        const result = await createBroadcast({
          title,
          message,
          broadcast_type: broadcastType,
          audience,
          audience_risk: audience === "By inherent risk" ? audienceRisk : null,
          vendor_ids: audience === "Selected vendors" ? selectedVendorIds : undefined,
          follow_up_due_date: followUpDueDate || null,
        });

        if (!result.ok) {
          setError(result.error);
          return;
        }

        const emails = result.recipientEmails.filter(Boolean);
        setSuccess({
          recipientCount: result.recipientCount,
          mailtoHref: emails.length
            ? `mailto:?bcc=${encodeURIComponent(emails.join(","))}&subject=${encodeURIComponent(
                title.trim()
              )}&body=${encodeURIComponent(message.trim())}`
            : null,
        });
        setTitle("");
        setMessage("");
        setSelectedVendorIds([]);
        setFollowUpDueDate("");
        router.refresh();
      } catch {
        setError("Failed to create outreach. Please try again.");
      }
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Compose outreach</CardTitle>
          <CardDescription>
            Choose the audience, write the message, and set a follow-up due date if needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setSuccess(null);
              }}
              placeholder="e.g. Updated review cadence policy"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={broadcastType}
                onValueChange={(value) => setBroadcastType(value as BroadcastType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BROADCAST_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="follow_up_due_date">Follow-up due date</Label>
              <Input
                id="follow_up_due_date"
                type="date"
                value={followUpDueDate}
                onChange={(e) => setFollowUpDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setSuccess(null);
              }}
              rows={8}
              placeholder="Write the message vendors will receive…"
              className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="space-y-2">
            <Label>Audience</Label>
            <Select
              value={audience}
              onValueChange={(value) => {
                setAudience(value as BroadcastAudience);
                setSuccess(null);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUDIENCES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {audience === "By inherent risk" && (
            <div className="space-y-2">
              <Label>Inherent risk</Label>
              <Select
                value={audienceRisk}
                onValueChange={(value) => setAudienceRisk(value as InherentRisk)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RISK_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {audience === "Selected vendors" && (
            <div className="space-y-2">
              <Label>Vendors</Label>
              <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border border-border/80 p-2">
                {vendors.map((vendor) => {
                  const checked = selectedVendorIds.includes(vendor.id);
                  return (
                    <label
                      key={vendor.id}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-neutral-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleVendor(vendor.id)}
                        className="h-4 w-4 rounded border-input"
                      />
                      <span className="font-medium">{vendor.name}</span>
                      <span className="text-muted-foreground">· {vendor.inherent_risk}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
            <p className="text-sm text-muted-foreground">
              {audienceCount} recipient{audienceCount === 1 ? "" : "s"} selected
            </p>
            <div className="flex items-center gap-3">
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button
                onClick={handleSubmit}
                disabled={isPending || !title.trim() || !message.trim() || audienceCount === 0}
              >
                <Megaphone className="h-4 w-4" />
                {isPending ? "Saving..." : "Log outreach"}
              </Button>
            </div>
          </div>
          {success && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              <span>
                Outreach logged for {success.recipientCount} vendor
                {success.recipientCount === 1 ? "" : "s"}. Emails are not sent automatically.
              </span>
              <div className="flex items-center gap-3">
                {success.mailtoHref && (
                  <a href={success.mailtoHref} className="inline-flex items-center gap-1 font-medium underline">
                    <Mail className="h-3.5 w-3.5" />
                    Email recipients
                  </a>
                )}
                <Link href="/outreach/follow-up" className="font-medium underline">
                  Open follow-up
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Before you send</CardTitle>
          <CardDescription>
            Outreach creates follow-up rows for each recipient so you can track acknowledgements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Use this for policy changes, assessment reminders, or incident notices.</p>
          <p>
            TrustHub records the outreach but does not send email itself. Use{" "}
            <span className="font-medium text-foreground">Email recipients</span> after logging to
            open a pre-filled message in your mail client.
          </p>
          <p>
            Afterwards, open <span className="font-medium text-foreground">Follow-up</span> to
            update recipient status and add notes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
