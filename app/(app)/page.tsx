import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DonutChart, VendorTypesChart, PipelineChart } from "@/components/dashboard/charts";
import { VendorTable } from "@/components/vendors/vendor-table";
import { getDashboardStats, getExperts, getTopOverdueVendors } from "@/lib/queries";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, overdueVendors, experts] = await Promise.all([
    getDashboardStats(),
    getTopOverdueVendors(8),
    getExperts(),
  ]);

  return (
    <div className="space-y-7">
      <div>
        <h1 className="page-title">Overview</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Real-time view of the third-party portfolio, assessment cadence, and inherent risk
          distribution.
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DonutChart
          title="Inherent Risk Distribution"
          description={`Across ${stats.totalVendors} vendors`}
          data={stats.inherentRiskDistribution}
        />
        <VendorTypesChart
          title="Vendor Types"
          description="Portfolio composition"
          data={stats.vendorTypes}
        />
        <PipelineChart
          title="Assessment Pipeline"
          description="Reviews by timeline"
          data={stats.assessmentPipeline}
        />
        <DonutChart
          title="Remediations Status"
          description={`${stats.totalRemediations} remediations`}
          data={stats.remediationsStatusDistribution}
        />
      </div>

      <Card className="border-border/80 shadow-none">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="card-title-serif">Overdue Reviews</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.overdueReviews > 8
                ? `Top 8 of ${stats.overdueReviews} overdue vendors, most overdue first`
                : "Most overdue first"}
            </p>
          </div>
          <Link
            href="/vendors?review=overdue"
            className="text-sm font-medium text-foreground hover:underline"
          >
            View all overdue →
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <VendorTable vendors={overdueVendors} experts={experts} variant="compact" />
        </CardContent>
      </Card>
    </div>
  );
}
