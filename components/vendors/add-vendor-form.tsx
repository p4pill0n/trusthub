"use client";

import { useState, useTransition } from "react";
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
import { createVendor } from "@/lib/actions";
import {
  DATA_CLASSIFICATIONS,
  DATA_TYPES,
  ENTITY_OPTIONS,
  RISK_LEVELS,
  VENDOR_TYPES,
} from "@/lib/constants";
import { todayIsoDate } from "@/lib/utils";
import { Plus } from "lucide-react";

const initialForm = {
  name: "",
  entity_name: "UK",
  type: "SaaS",
  datacontact_name: "",
  contact_email: "",
  os_manager_name: "",
  data_type: "PII",
  data_classification: "C2",
  inherent_risk: "Medium",
  residual_risk: "Medium",
  last_review_date: "",
};

type FormState = typeof initialForm;

interface AddVendorFormProps {
  onSuccess?: (vendorId: string) => void;
  idPrefix?: string;
}

export function AddVendorForm({ onSuccess, idPrefix = "" }: AddVendorFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fieldId = (name: string) => (idPrefix ? `${idPrefix}-${name}` : name);

  const canSubmit =
    form.name.trim() &&
    form.datacontact_name.trim() &&
    form.contact_email.trim() &&
    form.os_manager_name.trim();

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);

    startTransition(async () => {
      try {
        const result = await createVendor({
          ...form,
          last_review_date: form.last_review_date || null,
          status: form.last_review_date ? "Active" : "Under Review",
        });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setForm(initialForm);
        router.refresh();
        onSuccess?.(result.id);
      } catch {
        setError("Failed to add vendor. Please try again.");
      }
    });
  }

  function selectField(
    key: keyof FormState,
    label: string,
    options: readonly string[]
  ) {
    return (
      <div className="space-y-2">
        <Label htmlFor={fieldId(key)}>{label}</Label>
        <Select value={form[key]} onValueChange={(v) => set(key, v)}>
          <SelectTrigger id={fieldId(key)}>
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={fieldId("name")}>Legal entity name</Label>
          <Input
            id={fieldId("name")}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Acme Corporation Ltd."
            required
          />
        </div>

        {selectField("type", "Vendor type", VENDOR_TYPES)}
        {selectField("entity_name", "Entity", ENTITY_OPTIONS)}

        <div className="space-y-2">
          <Label htmlFor={fieldId("contact-name")}>Primary contact name</Label>
          <Input
            id={fieldId("contact-name")}
            value={form.datacontact_name}
            onChange={(e) => set("datacontact_name", e.target.value)}
            placeholder="Jane Smith"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={fieldId("contact-email")}>Primary contact email</Label>
          <Input
            id={fieldId("contact-email")}
            type="email"
            value={form.contact_email}
            onChange={(e) => set("contact_email", e.target.value)}
            placeholder="jane.smith@vendor.com"
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={fieldId("os-manager-name")}>OS manager name</Label>
          <Input
            id={fieldId("os-manager-name")}
            value={form.os_manager_name}
            onChange={(e) => set("os_manager_name", e.target.value)}
            placeholder="e.g. John Doe"
            required
          />
        </div>

        {selectField("data_type", "Data type", DATA_TYPES)}
        {selectField("data_classification", "Data classification", DATA_CLASSIFICATIONS)}
        {selectField("inherent_risk", "Inherent risk", RISK_LEVELS)}
        {selectField("residual_risk", "Residual risk", RISK_LEVELS)}

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={fieldId("last-review")}>Last review date (optional)</Label>
          <Input
            id={fieldId("last-review")}
            type="date"
            max={todayIsoDate()}
            value={form.last_review_date}
            onChange={(e) => set("last_review_date", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Leave blank for a new vendor. It stays Under Review until its first assessment is
            completed.
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={isPending || !canSubmit}>
        <Plus className="h-4 w-4" />
        {isPending ? "Adding..." : "Add vendor"}
      </Button>
    </form>
  );
}
