"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { saveTprmPolicy } from "@/lib/actions";
import { MAX_REVIEW_MONTHS, validatePolicyInput } from "@/lib/policy";
import { formatDateTime } from "@/lib/utils";
import type { TprmPolicy, TprmPolicyInput } from "@/types";
import { Check, Save } from "lucide-react";

interface PolicySettingsClientProps {
  policy: TprmPolicy;
}

type PolicyForm = Record<keyof TprmPolicyInput, string>;

const POLICY_ROWS = [
  ["Low", "review_months_low"],
  ["Medium", "review_months_medium"],
  ["High", "review_months_high"],
  ["Very High", "review_months_very_high"],
] as const;

function toForm(policy: TprmPolicy): PolicyForm {
  return {
    review_months_low: String(policy.review_months_low),
    review_months_medium: String(policy.review_months_medium),
    review_months_high: String(policy.review_months_high),
    review_months_very_high: String(policy.review_months_very_high),
  };
}

function toInput(form: PolicyForm): TprmPolicyInput {
  return {
    review_months_low: Number(form.review_months_low),
    review_months_medium: Number(form.review_months_medium),
    review_months_high: Number(form.review_months_high),
    review_months_very_high: Number(form.review_months_very_high),
  };
}

function isValidMonths(value: string) {
  const n = Number(value);
  return value.trim() !== "" && Number.isInteger(n) && n >= 1 && n <= MAX_REVIEW_MONTHS;
}

export function PolicySettingsClient({ policy }: PolicySettingsClientProps) {
  const [form, setForm] = useState<PolicyForm>(() => toForm(policy));
  const [policyId, setPolicyId] = useState(policy.id);
  const [updatedAt, setUpdatedAt] = useState(policy.updated_at);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function update(key: keyof TprmPolicyInput, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setError(null);
  }

  function handleSave() {
    const input = toInput(form);
    const invalid = validatePolicyInput(input);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const result = await saveTprmPolicy(policyId, input);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setPolicyId(result.policy.id);
        setUpdatedAt(result.policy.updated_at);
        setSaved(true);
      } catch {
        setError("Failed to save policy.");
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {updatedAt ? `Last saved ${formatDateTime(updatedAt)}` : "Not saved yet"}
        </p>
        <div className="flex items-center gap-3">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {saved && !error && (
            <p className="flex items-center gap-1.5 text-sm text-emerald-700">
              <Check className="h-3.5 w-3.5" />
              Saved — next review dates recalculated
            </p>
          )}
          <Button onClick={handleSave} disabled={isPending}>
            <Save className="h-4 w-4" />
            {isPending ? "Saving..." : "Save policy"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Review frequency by inherent risk</CardTitle>
          <CardDescription>
            How often vendors must be reassessed based on their inherent risk rating. Saving
            recalculates every vendor&apos;s next review date from its last review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Inherent risk</TableHead>
                <TableHead>Review every</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {POLICY_ROWS.map(([label, key]) => (
                <TableRow key={key}>
                  <TableCell className="font-medium">{label}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Input
                        id={key}
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={MAX_REVIEW_MONTHS}
                        step={1}
                        value={form[key]}
                        onChange={(e) => update(key, e.target.value)}
                        aria-invalid={!isValidMonths(form[key])}
                        className={
                          isValidMonths(form[key])
                            ? "h-9 w-24"
                            : "h-9 w-24 border-red-400 focus-visible:ring-red-400"
                        }
                      />
                      <span className="text-sm text-muted-foreground">months</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
