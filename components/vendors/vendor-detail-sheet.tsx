"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardList, Pencil } from "lucide-react";
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
import { RiskBadge, StatusBadge } from "@/components/shared/risk-badge";
import { AssessmentStatusBadge } from "@/components/risk-assessment/assessment-status-badge";
import { VendorAvatar } from "@/components/vendors/vendor-avatar";
import { loadVendorActivity, updateVendor } from "@/lib/actions";
import { getAssessmentDisplayStatus } from "@/lib/assessment-status";
import {
  DATA_CLASSIFICATIONS,
  DATA_TYPES,
  ENTITY_OPTIONS,
  RISK_LEVELS,
  VENDOR_STATUSES,
  VENDOR_TYPES,
} from "@/lib/constants";
import { REMEDIATION_STATUS_LABELS } from "@/lib/remediation-status";
import { formatDate, getVendorReviewStatus, todayIsoDate } from "@/lib/utils";
import type {
  Expert,
  ExpertDomain,
  ExpertRegion,
  Vendor,
  VendorActivity,
  VendorStatus,
} from "@/types";

interface VendorDetailSheetProps {
  vendor: Vendor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experts?: Expert[];
}

const DOMAIN_ORDER: ExpertDomain[] = [
  "TPRM",
  "Cyber",
  "BCM",
  "Operational Risk",
  "Legal",
  "Compliance",
];

const REGION_FLAG_CODES: Record<ExpertRegion, string> = {
  France: "fr",
  UK: "gb",
  AMER: "us",
  ASIA: "sg",
  India: "in",
};

type VendorDraft = {
  name: string;
  entity_name: string;
  type: string;
  datacontact_name: string;
  contact_email: string;
  os_manager_name: string;
  data_type: string;
  data_classification: string;
  inherent_risk: string;
  residual_risk: string;
  status: VendorStatus;
  last_review_date: string;
};

function toVendorDraft(vendor: Vendor): VendorDraft {
  return {
    name: vendor.name,
    entity_name: vendor.entity_name,
    type: vendor.type,
    datacontact_name: vendor.datacontact_name,
    contact_email: vendor.contact_email,
    os_manager_name: vendor.os_manager_name ?? "",
    data_type: vendor.data_type,
    data_classification: vendor.data_classification,
    inherent_risk: vendor.inherent_risk,
    residual_risk: vendor.residual_risk,
    status: vendor.status,
    last_review_date: vendor.last_review_date?.slice(0, 10) ?? "",
  };
}

function RegionFlag({ region }: { region: string }) {
  const code = REGION_FLAG_CODES[region as ExpertRegion];
  if (!code) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
      width={20}
      height={15}
      alt=""
      className="inline-block h-[15px] w-5 shrink-0 rounded-[2px] object-cover shadow-sm ring-1 ring-black/10"
      loading="lazy"
    />
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ActivitySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

function VendorActivityPanel({ vendor, open }: { vendor: Vendor; open: boolean }) {
  const [activity, setActivity] = useState<VendorActivity | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError(null);
    loadVendorActivity(vendor.id).then((result) => {
      if (cancelled) return;
      if (result.ok) setActivity(result.activity);
      else setError(result.error);
    });
    return () => {
      cancelled = true;
    };
  }, [open, vendor.id, vendor.last_review_date, vendor.status]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!activity) return <p className="text-sm text-muted-foreground">Loading activity…</p>;

  const openRemediations = activity.remediations.filter((r) => r.status !== "Closed");
  const openIncidents = activity.incidents.filter((i) => i.status === "Open");

  return (
    <div className="space-y-4">
      <ActivitySection title="Assessments">
        {activity.assessments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No assessments yet.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {activity.assessments.slice(0, 3).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">
                  Launched {formatDate(a.launched_at)}
                  {a.risk_score !== null ? ` · score ${a.risk_score}/100` : ""}
                </span>
                <AssessmentStatusBadge status={getAssessmentDisplayStatus(a)} />
              </li>
            ))}
          </ul>
        )}
      </ActivitySection>

      <ActivitySection title={`Open remediations (${openRemediations.length})`}>
        {openRemediations.length === 0 ? (
          <p className="text-sm text-muted-foreground">None open.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {openRemediations.slice(0, 4).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3">
                <span className="truncate">{r.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {REMEDIATION_STATUS_LABELS[r.status]} · due {formatDate(r.due_date)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </ActivitySection>

      <ActivitySection title={`Open incidents (${openIncidents.length})`}>
        {openIncidents.length === 0 ? (
          <p className="text-sm text-muted-foreground">None open.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {openIncidents.slice(0, 4).map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3">
                <span className="truncate">{i.title}</span>
                <RiskBadge level={i.severity} />
              </li>
            ))}
          </ul>
        )}
      </ActivitySection>

      <ActivitySection title="BitSight">
        <p className="text-sm">
          {activity.bitsight
            ? `${activity.bitsight.score} · ${activity.bitsight.rating} (fetched ${formatDate(activity.bitsight.fetched_at)})`
            : "No rating on file."}
        </p>
      </ActivitySection>
    </div>
  );
}

export function VendorDetailSheet({
  vendor,
  open,
  onOpenChange,
  experts = [],
}: VendorDetailSheetProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<VendorDraft>(() => toVendorDraft(vendor));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const displayEntity = editing ? draft.entity_name : vendor.entity_name;
  const reviewStatus = getVendorReviewStatus(vendor);

  const regionExperts = useMemo(() => {
    return experts
      .filter((expert) => expert.region === displayEntity)
      .sort((a, b) => DOMAIN_ORDER.indexOf(a.domain) - DOMAIN_ORDER.indexOf(b.domain));
  }, [experts, displayEntity]);

  useEffect(() => {
    if (!open) return;
    setEditing(false);
    setDraft(toVendorDraft(vendor));
    setError(null);
  }, [open, vendor]);

  function updateDraft<K extends keyof VendorDraft>(field: K, value: VendorDraft[K]) {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  function handleCancelEdit() {
    setDraft(toVendorDraft(vendor));
    setEditing(false);
    setError(null);
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateVendor(vendor.id, {
        ...draft,
        last_review_date: draft.last_review_date || null,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title={vendor.name} onClose={() => onOpenChange(false)}>
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-3 border-b border-border/80 pb-4">
            <div className="flex items-center gap-3">
              <VendorAvatar
                name={editing ? draft.name || vendor.name : vendor.name}
                contactEmail={editing ? draft.contact_email : vendor.contact_email}
              />
              <div>
                <p className="font-medium">{editing ? draft.name || vendor.name : vendor.name}</p>
                <p className="text-sm text-muted-foreground">
                  {editing ? draft.type : vendor.type}
                </p>
              </div>
            </div>
            {!editing && (
              <div className="flex items-center gap-2">
                {vendor.status !== "Offboarded" && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/risk-assessment?vendor=${vendor.id}`}>
                      <ClipboardList className="h-4 w-4" />
                      Assess
                    </Link>
                  </Button>
                )}
                <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`vendor-name-${vendor.id}`}>Name</Label>
                <Input
                  id={`vendor-name-${vendor.id}`}
                  value={draft.name}
                  onChange={(e) => updateDraft("name", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Entity</Label>
                  <Select
                    value={draft.entity_name}
                    onValueChange={(v) => updateDraft("entity_name", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTITY_OPTIONS.map((entity) => (
                        <SelectItem key={entity} value={entity}>
                          <span className="inline-flex items-center gap-2">
                            <RegionFlag region={entity} />
                            {entity}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <SelectField
                  label="Type"
                  value={draft.type}
                  options={VENDOR_TYPES}
                  onChange={(v) => updateDraft("type", v)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Status"
                  value={draft.status}
                  options={VENDOR_STATUSES}
                  onChange={(v) => updateDraft("status", v as VendorStatus)}
                />
                <div className="space-y-2">
                  <Label htmlFor={`vendor-os-${vendor.id}`}>OS Manager</Label>
                  <Input
                    id={`vendor-os-${vendor.id}`}
                    value={draft.os_manager_name}
                    onChange={(e) => updateDraft("os_manager_name", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Data Type"
                  value={draft.data_type}
                  options={DATA_TYPES}
                  onChange={(v) => updateDraft("data_type", v)}
                />
                <SelectField
                  label="Classification"
                  value={draft.data_classification}
                  options={DATA_CLASSIFICATIONS}
                  onChange={(v) => updateDraft("data_classification", v)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`vendor-contact-${vendor.id}`}>Contact</Label>
                  <Input
                    id={`vendor-contact-${vendor.id}`}
                    value={draft.datacontact_name}
                    onChange={(e) => updateDraft("datacontact_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`vendor-email-${vendor.id}`}>Email</Label>
                  <Input
                    id={`vendor-email-${vendor.id}`}
                    type="email"
                    value={draft.contact_email}
                    onChange={(e) => updateDraft("contact_email", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Inherent Risk"
                  value={draft.inherent_risk}
                  options={RISK_LEVELS}
                  onChange={(v) => updateDraft("inherent_risk", v)}
                />
                <SelectField
                  label="Residual Risk"
                  value={draft.residual_risk}
                  options={RISK_LEVELS}
                  onChange={(v) => updateDraft("residual_risk", v)}
                />
              </div>
              <p className="-mt-2 text-xs text-muted-foreground">
                Residual risk is set from the questionnaire security score each time an assessment is
                completed. You can override it here.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`vendor-last-${vendor.id}`}>Last Review</Label>
                  <Input
                    id={`vendor-last-${vendor.id}`}
                    type="date"
                    max={todayIsoDate()}
                    value={draft.last_review_date}
                    onChange={(e) => updateDraft("last_review_date", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Next Review</Label>
                  <p className="pt-2 text-sm text-muted-foreground">
                    Calculated from the review policy and inherent risk.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="text-sm text-muted-foreground">Entity</p>
                <p className="flex items-center gap-2 font-medium">
                  <RegionFlag region={vendor.entity_name} />
                  {vendor.entity_name}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p>{vendor.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={vendor.status} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data Type</p>
                  <p>{vendor.data_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Classification</p>
                  <p>{vendor.data_classification}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact</p>
                <p>{vendor.datacontact_name}</p>
                <p className="text-sm text-muted-foreground">{vendor.contact_email}</p>
              </div>
              {vendor.os_manager_name && (
                <div>
                  <p className="text-sm text-muted-foreground">OS Manager</p>
                  <p>{vendor.os_manager_name}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Inherent Risk</p>
                  <RiskBadge level={vendor.inherent_risk} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Residual Risk</p>
                  <RiskBadge level={vendor.residual_risk} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Last Review</p>
                  <p>{formatDate(vendor.last_review_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Review</p>
                  <p>
                    {formatDate(vendor.next_review_date)}
                    {reviewStatus.variant !== "none" && (
                      <span
                        className={
                          reviewStatus.variant === "overdue"
                            ? "ml-2 text-sm text-red-600"
                            : reviewStatus.variant === "unreviewed"
                              ? "ml-2 text-sm text-amber-700"
                              : "ml-2 text-sm text-muted-foreground"
                        }
                      >
                        ({reviewStatus.label})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          {editing && (
            <div className="flex items-center justify-end gap-2 border-t border-border/80 pt-4">
              <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={isPending}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSave} disabled={isPending}>
                {isPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          )}

          {!editing && (
            <div className="border-t border-border/80 pt-5">
              <p className="mb-3 text-sm font-medium text-foreground">Activity</p>
              <VendorActivityPanel vendor={vendor} open={open} />
            </div>
          )}

          <div className="border-t border-border/80 pt-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <RegionFlag region={displayEntity} />
                <p className="text-sm font-medium text-foreground">Experts — {displayEntity}</p>
              </div>
              <Link
                href="/experts"
                className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Manage experts
              </Link>
            </div>
            {regionExperts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No expert contacts configured for this region.
              </p>
            ) : (
              <div className="divide-y divide-border/70 rounded-md border border-border/70">
                {regionExperts.map((expert) => (
                  <div key={expert.id} className="px-3 py-2.5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {expert.domain}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-foreground">{expert.name}</p>
                    <a
                      href={`mailto:${expert.email}`}
                      className="mt-0.5 inline-block text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      {expert.email}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
