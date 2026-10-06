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
import { formatDateTime } from "@/lib/utils";
import type { TprmPolicy, TprmPolicyInput } from "@/types";
import { Check, Save } from "lucide-react";

interface PolicySettingsClientProps {
  policy: TprmPolicy;
}

function toInput(policy: TprmPolicy): TprmPolicyInput {
  return {
    review_months_low: policy.review_months_low,
    review_months_medium: policy.review_months_medium,
    review_months_high: policy.review_months_high,
    review_months_very_high: policy.review_months_very_high,
  };
}

export function PolicySettingsClient({ policy }: PolicySettingsClientProps) {
  const [form, setForm] = useState<TprmPolicyInput>(() => toInput(policy));
  const [policyId, setPolicyId] = useState(policy.id);
  const [updatedAt, setUpdatedAt] = useState(policy.updated_at);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof TprmPolicyInput>(key: K, value: TprmPolicyInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await saveTprmPolicy(policyId, form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setPolicyId(result.policy.id);
      setUpdatedAt(result.policy.updated_at);
      setSaved(true);
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
              Saved
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
            How often vendors must be reassessed based on their inherent risk rating.
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
              {(
                [
                  ["Low", "review_months_low"],
                  ["Medium", "review_months_medium"],
                  ["High", "review_months_high"],
                  ["Very High", "review_months_very_high"],
                ] as const
              ).map(([label, key]) => (
                <TableRow key={key}>
                  <TableCell className="font-medium">{label}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Input
                        id={key}
                        type="number"
                        min={1}
                        value={form[key]}
                        onChange={(e) => update(key, Number(e.target.value) || 1)}
                        className="h-9 w-24"
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
