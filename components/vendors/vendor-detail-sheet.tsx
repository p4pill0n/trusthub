"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
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
import { VendorAvatar } from "@/components/vendors/vendor-avatar";
import { saveExperts, updateVendor } from "@/lib/actions";
import { formatDate } from "@/lib/utils";
import type {
  DataClassification,
  DataType,
  Expert,
  ExpertDomain,
  ExpertRegion,
  InherentRisk,
  ResidualRisk,
  Vendor,
  VendorStatus,
  VendorType,
} from "@/types";

interface VendorDetailSheetProps {
  vendor: Vendor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experts?: Expert[];
}

const ENTITY_OPTIONS: ExpertRegion[] = ["France", "UK", "AMER", "ASIA", "India"];

const VENDOR_TYPES: VendorType[] = [
  "SaaS",
  "On-Premise Software",
  "Consulting",
  "Payroll",
  "Cloud Infrastructure",
  "Market Data",
  "Managed Services",
];

const DATA_TYPES: DataType[] = ["PII", "Financial", "Legal"];
const DATA_CLASSIFICATIONS: DataClassification[] = ["C0", "C1", "C2", "C3"];
const RISK_LEVELS: InherentRisk[] = ["Low", "Medium", "High", "Very High"];
const STATUS_OPTIONS: VendorStatus[] = ["Active", "Offboarded", "Under Review"];

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
  next_review_date: string;
};

type ExpertDraft = { name: string; email: string };

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
    last_review_date: vendor.last_review_date ?? "",
    next_review_date: vendor.next_review_date ?? "",
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

export function VendorDetailSheet({
  vendor,
  open,
  onOpenChange,
  experts = [],
}: VendorDetailSheetProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<VendorDraft>(() => toVendorDraft(vendor));
  const [expertDrafts, setExpertDrafts] = useState<Record<string, ExpertDraft>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const displayEntity = editing ? draft.entity_name : vendor.entity_name;

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

  useEffect(() => {
    if (!open) return;
    const nextExperts: Record<string, ExpertDraft> = {};
    for (const expert of experts.filter((e) => e.region === draft.entity_name)) {
      nextExperts[expert.id] = { name: expert.name, email: expert.email };
    }
    setExpertDrafts(nextExperts);
  }, [open, experts, draft.entity_name]);

  function updateDraft<K extends keyof VendorDraft>(field: K, value: VendorDraft[K]) {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  function updateExpertDraft(id: string, field: keyof ExpertDraft, value: string) {
    setExpertDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
    setError(null);
  }

  function handleCancelEdit() {
    setDraft(toVendorDraft(vendor));
    const nextExperts: Record<string, ExpertDraft> = {};
    for (const expert of experts.filter((e) => e.region === vendor.entity_name)) {
      nextExperts[expert.id] = { name: expert.name, email: expert.email };
    }
    setExpertDrafts(nextExperts);
    setEditing(false);
    setError(null);
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const vendorResult = await updateVendor(vendor.id, {
        name: draft.name,
        entity_name: draft.entity_name,
        type: draft.type,
        datacontact_name: draft.datacontact_name,
        contact_email: draft.contact_email,
        os_manager_name: draft.os_manager_name,
        data_type: draft.data_type,
        data_classification: draft.data_classification,
        inherent_risk: draft.inherent_risk as InherentRisk,
        residual_risk: draft.residual_risk as ResidualRisk,
        status: draft.status,
        last_review_date: draft.last_review_date || null,
        next_review_date: draft.next_review_date || null,
      });

      if (!vendorResult.ok) {
        setError(vendorResult.error);
        return;
      }

      const expertUpdates = regionExperts
        .map((expert) => {
          const row = expertDrafts[expert.id];
          if (!row) return null;
          if (row.name === expert.name && row.email === expert.email) return null;
          return { id: expert.id, name: row.name, email: row.email };
        })
        .filter((row): row is { id: string; name: string; email: string } => row !== null);

      if (expertUpdates.length > 0) {
        const expertsResult = await saveExperts(expertUpdates);
        if (!expertsResult.ok) {
          setError(expertsResult.error);
          return;
        }
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
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
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
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={draft.type} onValueChange={(v) => updateDraft("type", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VENDOR_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={draft.status}
                    onValueChange={(v) => updateDraft("status", v as VendorStatus)}
                  >
                    <SelectTrigger>
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
                </div>
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
                <div className="space-y-2">
                  <Label>Data Type</Label>
                  <Select
                    value={draft.data_type}
                    onValueChange={(v) => updateDraft("data_type", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATA_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Classification</Label>
                  <Select
                    value={draft.data_classification}
                    onValueChange={(v) => updateDraft("data_classification", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATA_CLASSIFICATIONS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                <div className="space-y-2">
                  <Label>Inherent Risk</Label>
                  <Select
                    value={draft.inherent_risk}
                    onValueChange={(v) => updateDraft("inherent_risk", v)}
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
                <div className="space-y-2">
                  <Label>Residual Risk</Label>
                  <Select
                    value={draft.residual_risk}
                    onValueChange={(v) => updateDraft("residual_risk", v)}
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`vendor-last-${vendor.id}`}>Last Review</Label>
                  <Input
                    id={`vendor-last-${vendor.id}`}
                    type="date"
                    value={draft.last_review_date}
                    onChange={(e) => updateDraft("last_review_date", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`vendor-next-${vendor.id}`}>Next Review</Label>
                  <Input
                    id={`vendor-next-${vendor.id}`}
                    type="date"
                    value={draft.next_review_date}
                    onChange={(e) => updateDraft("next_review_date", e.target.value)}
                  />
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
                  <p>{formatDate(vendor.next_review_date)}</p>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-border/80 pt-5">
            <div className="mb-3 flex items-center gap-2">
              <RegionFlag region={displayEntity} />
              <p className="text-sm font-medium text-foreground">Experts — {displayEntity}</p>
            </div>
            {regionExperts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No expert contacts configured for this region.
              </p>
            ) : editing ? (
              <div className="space-y-3">
                {regionExperts.map((expert) => {
                  const row = expertDrafts[expert.id] ?? {
                    name: expert.name,
                    email: expert.email,
                  };
                  return (
                    <div
                      key={expert.id}
                      className="space-y-2 rounded-md border border-border/70 bg-neutral-50/70 px-3 py-3"
                    >
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {expert.domain}
                      </p>
                      <Input
                        value={row.name}
                        onChange={(e) => updateExpertDraft(expert.id, "name", e.target.value)}
                        placeholder="Name"
                      />
                      <Input
                        type="email"
                        value={row.email}
                        onChange={(e) => updateExpertDraft(expert.id, "email", e.target.value)}
                        placeholder="Email"
                      />
                    </div>
                  );
                })}
              </div>
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

          {error && <p className="text-sm text-red-600">{error}</p>}

          {editing && (
            <div className="flex items-center justify-end gap-2 border-t border-border/80 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleSave} disabled={isPending}>
                {isPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
