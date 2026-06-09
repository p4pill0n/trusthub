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
import { Plus } from "lucide-react";

const ENTITY_OPTIONS = ["France", "UK", "AMER", "ASIA"] as const;

const VENDOR_TYPES = [
  "SaaS",
  "On-Premise Software",
  "Consulting",
  "Payroll",
  "Cloud Infrastructure",
  "Market Data",
  "Managed Services",
] as const;

const initialForm = {
  name: "",
  entity_name: "UK",
  type: "SaaS",
  datacontact_name: "",
  contact_email: "",
  os_manager_name: "",
};

interface AddVendorFormProps {
  onSuccess?: () => void;
  idPrefix?: string;
}

export function AddVendorForm({ onSuccess, idPrefix = "" }: AddVendorFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [isPending, startTransition] = useTransition();
  const fieldId = (name: string) => (idPrefix ? `${idPrefix}-${name}` : name);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.datacontact_name || !form.contact_email || !form.os_manager_name) {
      return;
    }

    startTransition(async () => {
      await createVendor({
        name: form.name,
        entity_name: form.entity_name,
        type: form.type,
        datacontact_name: form.datacontact_name,
        contact_email: form.contact_email,
        os_manager_name: form.os_manager_name,
        data_type: "PII",
        data_classification: "C2",
        inherent_risk: "Medium",
        residual_risk: "Medium",
        status: "Active",
      });
      setForm(initialForm);
      router.refresh();
      onSuccess?.();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={fieldId("name")}>Legal entity name</Label>
          <Input
            id={fieldId("name")}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Acme Corporation Ltd."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={fieldId("type")}>Vendor type</Label>
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
            <SelectTrigger id={fieldId("type")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VENDOR_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={fieldId("entity")}>Entity</Label>
          <Select
            value={form.entity_name}
            onValueChange={(v) => setForm({ ...form, entity_name: v })}
          >
            <SelectTrigger id={fieldId("entity")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ENTITY_OPTIONS.map((entity) => (
                <SelectItem key={entity} value={entity}>
                  {entity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={fieldId("contact-name")}>Primary contact name</Label>
          <Input
            id={fieldId("contact-name")}
            value={form.datacontact_name}
            onChange={(e) => setForm({ ...form, datacontact_name: e.target.value })}
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
            onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
            placeholder="jane.smith@vendor.com"
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={fieldId("os-manager-name")}>OS manager name</Label>
          <Input
            id={fieldId("os-manager-name")}
            value={form.os_manager_name}
            onChange={(e) => setForm({ ...form, os_manager_name: e.target.value })}
            placeholder="e.g. John Doe"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={
          isPending || !form.name || !form.contact_email || !form.os_manager_name
        }
      >
        <Plus className="h-4 w-4" />
        {isPending ? "Adding..." : "Add vendor"}
      </Button>
    </form>
  );
}
