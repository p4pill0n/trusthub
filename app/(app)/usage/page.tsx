import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDailyViewerCounts } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function UsagePage() {
  const daily = await getDailyViewerCounts(7);
  const today = daily[daily.length - 1]?.viewers ?? 0;
  const last7 = daily.reduce((sum, row) => sum + row.viewers, 0);
  const max = Math.max(...daily.map((row) => row.viewers), 1);
  const recent = [...daily].reverse();

  return (
    <div className="space-y-7">
      <PageHeader
        title="Usage"
        description="Unique app viewers per day. Each browser is counted once per calendar day when someone opens Trust Hub."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/80 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">{today}</p>
            <p className="mt-1 text-xs text-muted-foreground">Unique viewers</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last 7 days</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">{last7}</p>
            <p className="mt-1 text-xs text-muted-foreground">Viewer-days</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Viewers per day</CardTitle>
          <p className="text-sm text-muted-foreground">Last 7 days</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex h-36 items-end gap-2">
            {daily.map((row) => (
              <div
                key={row.date}
                className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1"
                title={`${formatDate(row.date)}: ${row.viewers}`}
              >
                <span className="text-[10px] text-muted-foreground">
                  {row.viewers > 0 ? row.viewers : ""}
                </span>
                <div
                  className="w-full rounded-t bg-[#1e3a5f]"
                  style={{ height: `${Math.max((row.viewers / max) * 100, row.viewers > 0 ? 8 : 2)}%` }}
                />
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border/80">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Viewers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((row) => (
                  <TableRow key={row.date}>
                    <TableCell>{formatDate(row.date)}</TableCell>
                    <TableCell className="text-right font-medium">{row.viewers}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
