import { KpiCard } from "@/components/dashboard/kpi-card";
import { DashboardExplore } from "@/components/dashboard/dashboard-explore";
import {
  getActiveVendors,
  getDashboardStats,
  getExperts,
  getRemediations,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, vendors, remediations, experts] = await Promise.all([
    getDashboardStats(),
    getActiveVendors(),
    getRemediations(),
    getExperts(),
  ]);

  const activeVendorIds = new Set(vendors.map((v) => v.id));
  const activeRemediations = remediations.filter((r) => activeVendorIds.has(r.vendor_id));

  return (
    <div className="space-y-7">
      <div>
        <h1 className="page-title">Overview</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Real-time view of the third-party portfolio, assessment cadence, and inherent risk
          distribution. Click a chart segment to explore the matching list below.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Active Vendors"
          value={stats.totalVendors}
          subtitle={`+${stats.newVendorsLast90Days} added in the last 90 days`}
          href="/vendors"
        />
        <KpiCard
          title="Very High Residual Risk"
          value={stats.veryHighResidualRisk}
          subtitle="Requires sign-off"
          variant={stats.veryHighResidualRisk > 0 ? "danger" : "default"}
        />
        <KpiCard
          title="Overdue Reviews"
          value={stats.overdueReviews}
          subtitle="Past next review date"
          variant={stats.overdueReviews > 0 ? "warning" : "default"}
          href="/vendors?review=overdue"
        />
        <KpiCard
          title="Due in 90 Days"
          value={stats.dueIn90Days}
          subtitle="Schedule renewal"
          href="/vendors?review=due90"
        />
        <KpiCard
          title="Open Incidents"
          value={stats.openIncidents}
          subtitle={`${stats.criticalOpenIncidents} high or critical`}
          variant={stats.criticalOpenIncidents > 0 ? "danger" : "default"}
          href="/incidents?status=Open"
        />
      </div>

      <DashboardExplore
        stats={stats}
        vendors={vendors}
        remediations={activeRemediations}
        experts={experts}
      />
    </div>
  );
}
