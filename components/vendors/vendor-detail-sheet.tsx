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
import { cn, formatDate, getVendorReviewStatus, todayIsoDate } from "@/lib/utils";
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
  business_referent_name: string;
  business_referent_email: string;
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
    business_referent_name: vendor.business_referent_name ?? "",
    business_referent_email: vendor.business_referent_email ?? "",
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

function DetailSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

function ActivitySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-3">
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
    <div className="grid gap-3 sm:grid-cols-2">
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

      <ActivitySection title={`Fourth parties (${activity.fourthParties.length})`}>
        {activity.fourthParties.length === 0 ? (
          <p className="text-sm text-muted-foreground">None recorded.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {activity.fourthParties.slice(0, 6).map((fp) => (
              <li key={fp.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{fp.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[fp.service_description, fp.country].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <RiskBadge level={fp.risk_level} />
              </li>
            ))}
          </ul>
        )}
      </ActivitySection>

      <ActivitySection title={`Interconnections (${activity.interconnections.length})`}>
        {activity.interconnections.length === 0 ? (
          <p className="text-sm text-muted-foreground">None recorded.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {activity.interconnections.slice(0, 6).map((ic) => (
              <li key={ic.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {ic.connection_type} · {ic.direction}
                  </p>
                  {ic.description && (
                    <p className="truncate text-xs text-muted-foreground">{ic.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
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
    <Sheet open={open} onOpenChange={onOpenChange} panelClassName="max-w-3xl">
      <SheetContent title={vendor.name} onClose={() => onOpenChange(false)}>
        <div className="space-y-8">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <VendorAvatar
                name={editing ? draft.name || vendor.name : vendor.name}
                contactEmail={editing ? draft.contact_email : vendor.contact_email}
              />
              <div>
                <p className="font-medium">{editing ? draft.name || vendor.name : vendor.name}</p>
                <p className="text-sm text-muted-foreground">
                  {editing ? draft.type : vendor.type}
                  {!editing && (
                    <>
                      {" · "}
                      <span className="inline-flex items-center gap-1.5 align-middle">
                        <RegionFlag region={vendor.entity_name} />
                        {vendor.entity_name}
                      </span>
                    </>
                  )}
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
            <div className="space-y-8">
              <DetailSection title="Overview">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`vendor-name-${vendor.id}`}>Vendor name</Label>
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
                    <SelectField
                      label="Status"
                      value={draft.status}
                      options={VENDOR_STATUSES}
                      onChange={(v) => updateDraft("status", v as VendorStatus)}
                    />
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
                </div>
              </DetailSection>

              <DetailSection title="Contacts">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`vendor-contact-${vendor.id}`}>Primary contact</Label>
                    <Input
                      id={`vendor-contact-${vendor.id}`}
                      value={draft.datacontact_name}
                      onChange={(e) => updateDraft("datacontact_name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`vendor-email-${vendor.id}`}>Primary contact email</Label>
                    <Input
                      id={`vendor-email-${vendor.id}`}
                      type="email"
                      value={draft.contact_email}
                      onChange={(e) => updateDraft("contact_email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`vendor-business-referent-${vendor.id}`}>Business Referent</Label>
                    <Input
                      id={`vendor-business-referent-${vendor.id}`}
                      value={draft.business_referent_name}
                      onChange={(e) => updateDraft("business_referent_name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`vendor-business-email-${vendor.id}`}>
                      Business Referent email
                    </Label>
                    <Input
                      id={`vendor-business-email-${vendor.id}`}
                      type="email"
                      value={draft.business_referent_email}
                      onChange={(e) => updateDraft("business_referent_email", e.target.value)}
                    />
                  </div>
                </div>
              </DetailSection>

              <DetailSection title="Risk & reviews">
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
                <p className="text-xs text-muted-foreground">
                  Residual risk is set from the questionnaire security score each time an assessment
                  is completed. You can override it here.
                </p>
              </DetailSection>
            </div>
          ) : (
            <div className="space-y-8">
              <DetailSection title="Overview">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                  <DetailField label="Vendor name">
                    <p className="font-medium">{vendor.name}</p>
                  </DetailField>
                  <DetailField label="Entity">
                    <p className="flex items-center gap-2 font-medium">
                      <RegionFlag region={vendor.entity_name} />
                      {vendor.entity_name}
                    </p>
                  </DetailField>
                  <DetailField label="Type">
                    <p>{vendor.type}</p>
                  </DetailField>
                  <DetailField label="Status">
                    <StatusBadge status={vendor.status} />
                  </DetailField>
                  <DetailField label="Data Type">
                    <p>{vendor.data_type}</p>
                  </DetailField>
                  <DetailField label="Classification">
                    <p>{vendor.data_classification}</p>
                  </DetailField>
                </div>
              </DetailSection>

              <DetailSection title="Contacts">
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  <DetailField label="Primary contact">
                    <p>{vendor.datacontact_name}</p>
                    <p className="text-muted-foreground">{vendor.contact_email}</p>
                  </DetailField>
                  <DetailField label="Business Referent">
                    {vendor.business_referent_name ? (
                      <>
                        <p>{vendor.business_referent_name}</p>
                        {vendor.business_referent_email && (
                          <p className="text-muted-foreground">{vendor.business_referent_email}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-muted-foreground">Not set</p>
                    )}
                  </DetailField>
                </div>
              </DetailSection>

              <DetailSection title="Risk & reviews">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                  <DetailField label="Inherent Risk">
                    <RiskBadge level={vendor.inherent_risk} />
                  </DetailField>
                  <DetailField label="Residual Risk">
                    <RiskBadge level={vendor.residual_risk} />
                  </DetailField>
                  <DetailField label="Last Review">
                    <p>{formatDate(vendor.last_review_date)}</p>
                  </DetailField>
                  <DetailField label="Next Review">
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
                  </DetailField>
                </div>
              </DetailSection>
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
            <DetailSection title="Activity">
              <VendorActivityPanel vendor={vendor} open={open} />
            </DetailSection>
          )}

          <DetailSection title="Experts">
            <div className="mb-1 flex items-center justify-end">
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
              <div className="grid gap-2 sm:grid-cols-2">
                {regionExperts.map((expert) => (
                  <div
                    key={expert.id}
                    className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5"
                  >
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
          </DetailSection>
        </div>
      </SheetContent>
    </Sheet>
  );
}
