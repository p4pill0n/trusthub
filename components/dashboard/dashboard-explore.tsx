"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { differenceInDays, parseISO, startOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DonutChart,
  PipelineChart,
  VendorTypesChart,
  type ChartSelection,
} from "@/components/dashboard/charts";
import { RiskBadge } from "@/components/shared/risk-badge";
import { VendorNameCell } from "@/components/vendors/vendor-name-cell";
import { VendorTable } from "@/components/vendors/vendor-table";
import { REMEDIATION_STATUS_LABELS } from "@/lib/remediation-status";
import { formatDate, isPastDate } from "@/lib/utils";
import type { DashboardStats, Expert, Remediation, Vendor } from "@/types";

interface DashboardExploreProps {
  stats: DashboardStats;
  vendors: Vendor[];
  remediations: Remediation[];
  experts: Expert[];
}

function pipelineBucket(vendor: Vendor, today: Date): string {
  if (!vendor.last_review_date || !vendor.next_review_date) return "Not reviewed";
  const days = differenceInDays(
    startOfDay(parseISO(vendor.next_review_date.slice(0, 10))),
    today
  );
  if (days < 0) return "Overdue";
  if (days < 30) return "< 30d";
  if (days <= 90) return "30–90d";
  return "> 90d";
}

function matchesInherent(vendor: Vendor, segment: string) {
  if (segment === "Very High") {
    return (
      vendor.inherent_risk === "Very High" || (vendor.inherent_risk as string) === "Critical"
    );
  }
  return vendor.inherent_risk === segment;
}

function remediationDbStatus(segment: string): Remediation["status"] | null {
  if (segment === "Not started") return "Open";
  if (segment === "In Progress") return "In Progress";
  if (segment === "Closed") return "Closed";
  return null;
}

function sortByNextReview(a: Vendor, b: Vendor) {
  return (a.next_review_date ?? "9999").localeCompare(b.next_review_date ?? "9999");
}

export function DashboardExplore({
  stats,
  vendors,
  remediations,
  experts,
}: DashboardExploreProps) {
  const [selection, setSelection] = useState<ChartSelection>(null);
  const today = useMemo(() => startOfDay(new Date()), []);

  const overdueVendors = useMemo(
    () =>
      vendors
        .filter((v) => pipelineBucket(v, today) === "Overdue")
        .sort(sortByNextReview),
    [vendors, today]
  );

  const activeRemediations = useMemo(
    () => remediations.filter((r) => r.vendors && vendors.some((v) => v.id === r.vendor_id)),
    [remediations, vendors]
  );

  const result = useMemo(() => {
    if (!selection) {
      return {
        kind: "vendors" as const,
        title: "Overdue Reviews",
        subtitle:
          overdueVendors.length > 0
            ? `${overdueVendors.length} overdue vendor${overdueVendors.length === 1 ? "" : "s"}, most overdue first`
            : "No overdue reviews right now",
        href: "/vendors?review=overdue",
        linkLabel: "View all overdue →",
        vendors: overdueVendors,
        remediations: [] as Remediation[],
      };
    }

    if (selection.chart === "inherent") {
      const list = vendors.filter((v) => matchesInherent(v, selection.segment)).sort(sortByNextReview);
      return {
        kind: "vendors" as const,
        title: `Inherent risk · ${selection.segment}`,
        subtitle: `${list.length} vendor${list.length === 1 ? "" : "s"}`,
        href: "/vendors",
        linkLabel: "View vendors →",
        vendors: list,
        remediations: [] as Remediation[],
      };
    }

    if (selection.chart === "type") {
      const list = vendors
        .filter((v) => v.type === selection.segment)
        .sort((a, b) => a.name.localeCompare(b.name));
      return {
        kind: "vendors" as const,
        title: `Vendor type · ${selection.segment}`,
        subtitle: `${list.length} vendor${list.length === 1 ? "" : "s"}`,
        href: "/vendors",
        linkLabel: "View vendors →",
        vendors: list,
        remediations: [] as Remediation[],
      };
    }

    if (selection.chart === "pipeline") {
      const list = vendors
        .filter((v) => pipelineBucket(v, today) === selection.segment)
        .sort(sortByNextReview);
      const href =
        selection.segment === "Overdue"
          ? "/vendors?review=overdue"
          : selection.segment === "< 30d" || selection.segment === "30–90d"
            ? "/vendors?review=due90"
            : "/vendors";
      return {
        kind: "vendors" as const,
        title: `Assessment pipeline · ${selection.segment}`,
        subtitle: `${list.length} vendor${list.length === 1 ? "" : "s"}`,
        href,
        linkLabel: "View vendors →",
        vendors: list,
        remediations: [] as Remediation[],
      };
    }

    const status = remediationDbStatus(selection.segment);
    const list = status
      ? activeRemediations.filter((r) => r.status === status)
      : [];
    return {
      kind: "remediations" as const,
      title: `Remediations · ${selection.segment}`,
      subtitle: `${list.length} remediation${list.length === 1 ? "" : "s"}`,
      href: "/remediations",
      linkLabel: "View remediations →",
      vendors: [] as Vendor[],
      remediations: list,
    };
  }, [selection, vendors, overdueVendors, activeRemediations, today]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DonutChart
          chartId="inherent"
          title="Inherent Risk Distribution"
          description={`Across ${stats.totalVendors} vendors · click a segment`}
          data={stats.inherentRiskDistribution}
          selection={selection}
          onSelect={setSelection}
        />
        <VendorTypesChart
          title="Vendor Types"
          description="Portfolio composition · click a bar"
          data={stats.vendorTypes}
          selection={selection}
          onSelect={setSelection}
        />
        <PipelineChart
          title="Assessment Pipeline"
          description="Reviews by timeline · click a bar"
          data={stats.assessmentPipeline}
          selection={selection}
          onSelect={setSelection}
        />
        <DonutChart
          chartId="remediations"
          title="Remediations Status"
          description={`${stats.totalRemediations} remediations · click a segment`}
          data={stats.remediationsStatusDistribution}
          selection={selection}
          onSelect={setSelection}
        />
      </div>

      <Card className="border-border/80 shadow-none">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="card-title-serif">{result.title}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">{result.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            {selection && (
              <Button type="button" variant="outline" size="sm" onClick={() => setSelection(null)}>
                Reset to overdue
              </Button>
            )}
            <Link
              href={result.href}
              className="text-sm font-medium text-foreground hover:underline"
            >
              {result.linkLabel}
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {result.kind === "vendors" ? (
            result.vendors.length > 0 ? (
              <VendorTable vendors={result.vendors} experts={experts} variant="compact" />
            ) : (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                No vendors in this selection.
              </p>
            )
          ) : result.remediations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Vendor</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.remediations.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell>
                      <VendorNameCell
                        vendorId={rec.vendor_id}
                        name={rec.vendors?.name}
                        contactEmail={rec.vendors?.contact_email}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{rec.title}</TableCell>
                    <TableCell>
                      <RiskBadge level={rec.priority} />
                    </TableCell>
                    <TableCell
                      className={
                        rec.status !== "Closed" && isPastDate(rec.due_date)
                          ? "text-red-600"
                          : undefined
                      }
                    >
                      {formatDate(rec.due_date)}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {REMEDIATION_STATUS_LABELS[rec.status]}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              No remediations in this selection.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
