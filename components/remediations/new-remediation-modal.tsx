"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createRemediation } from "@/lib/actions";
import { formatDate } from "@/lib/utils";
import type { Vendor } from "@/types";
import { Plus } from "lucide-react";

export type RemediationAssessmentOption = {
  id: string;
  vendor_id: string;
  completed_at: string | null;
  risk_score: number | null;
};

interface NewRemediationModalProps {
  vendors: Vendor[];
  assessments: RemediationAssessmentOption[];
  preselectedVendorId?: string;
  preselectedAssessmentId?: string;
}

const NO_ASSESSMENT = "none";

function emptyForm(vendorId = "", assessmentId = NO_ASSESSMENT) {
  return {
    vendor_id: vendorId,
    assessment_id: assessmentId,
    title: "",
    description: "",
    priority: "Medium",
    due_date: "",
    owner: "",
  };
}

export function NewRemediationModal({
  vendors,
  assessments,
  preselectedVendorId,
  preselectedAssessmentId,
}: NewRemediationModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(Boolean(preselectedVendorId));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(() =>
    emptyForm(preselectedVendorId, preselectedAssessmentId ?? NO_ASSESSMENT)
  );

  const vendorAssessments = useMemo(
    () => assessments.filter((a) => a.vendor_id === form.vendor_id),
    [assessments, form.vendor_id]
  );

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setForm(emptyForm());
      setError(null);
      if (preselectedVendorId) router.replace(pathname);
    }
  }

  function handleSubmit() {
    if (!form.vendor_id || !form.title.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await createRemediation({
          ...form,
          assessment_id: form.assessment_id === NO_ASSESSMENT ? null : form.assessment_id,
        });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        handleOpenChange(false);
      } catch {
        setError("Failed to create remediation. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          New Remediation
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Remediation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Vendor</Label>
            <Select
              value={form.vendor_id}
              onValueChange={(v) => setForm({ ...form, vendor_id: v, assessment_id: NO_ASSESSMENT })}
            >
              <SelectTrigger><SelectValue placeholder="Select vendor..." /></SelectTrigger>
              <SelectContent>
                {vendors.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Related assessment</Label>
            <Select
              value={form.assessment_id}
              onValueChange={(v) => setForm({ ...form, assessment_id: v })}
              disabled={!form.vendor_id}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_ASSESSMENT}>None</SelectItem>
                {vendorAssessments.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    Completed {formatDate(a.completed_at)}
                    {a.risk_score !== null ? ` · score ${a.risk_score}/100` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Low", "Medium", "High", "Critical"].map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Due Date (optional)</Label>
              <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Owner (optional)</Label>
            <Input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending || !form.vendor_id || !form.title.trim()}>
            {isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
