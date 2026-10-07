"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RISK_COLORS, cn } from "@/lib/utils";

export type ChartSelection = {
  chart: "inherent" | "type" | "pipeline" | "remediations";
  segment: string;
} | null;

interface DonutChartProps {
  title: string;
  description?: string;
  data: { name: string; value: number; color?: string }[];
  chartId: "inherent" | "remediations";
  selection: ChartSelection;
  onSelect: (selection: ChartSelection) => void;
}

export function DonutChart({
  title,
  description,
  data,
  chartId,
  selection,
  onSelect,
}: DonutChartProps) {
  const colors = [
    RISK_COLORS.Low,
    RISK_COLORS.Medium,
    RISK_COLORS.High,
    RISK_COLORS["Very High"],
  ];
  const entries = data.map((entry, index) => ({
    ...entry,
    color: entry.color ?? colors[index % colors.length],
  }));
  const slices = entries.filter((d) => d.value > 0);
  const activeSegment =
    selection?.chart === chartId ? selection.segment : null;

  function selectSegment(segment: string) {
    if (selection?.chart === chartId && selection.segment === segment) {
      onSelect(null);
      return;
    }
    onSelect({ chart: chartId, segment });
  }

  return (
    <Card className="border-border/80 shadow-none">
      <CardHeader className="pb-1">
        <CardTitle className="card-title-serif">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pb-5">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={slices}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={2}
              dataKey="value"
              style={{ cursor: "pointer" }}
              onClick={(_, index) => {
                const segment = slices[index]?.name;
                if (segment) selectSegment(segment);
              }}
            >
              {slices.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                  fillOpacity={
                    activeSegment && activeSegment !== entry.name ? 0.28 : 1
                  }
                  stroke={activeSegment === entry.name ? "#0f172a" : "none"}
                  strokeWidth={activeSegment === entry.name ? 1.5 : 0}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {entries.map((entry) => {
            const selected = activeSegment === entry.name;
            const dimmed = Boolean(activeSegment && !selected);
            return (
              <button
                key={entry.name}
                type="button"
                onClick={() => entry.value > 0 && selectSegment(entry.name)}
                disabled={entry.value === 0}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs transition-colors",
                  entry.value > 0 && "hover:bg-muted/60",
                  selected && "bg-muted",
                  dimmed && "opacity-40",
                  entry.value === 0 && "cursor-default opacity-40"
                )}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">{entry.name}</span>
                <span className="font-medium text-foreground">{entry.value}</span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface VendorTypesChartProps {
  title: string;
  description?: string;
  data: { name: string; value: number }[];
  selection: ChartSelection;
  onSelect: (selection: ChartSelection) => void;
}

export function VendorTypesChart({
  title,
  description,
  data,
  selection,
  onSelect,
}: VendorTypesChartProps) {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const activeSegment = selection?.chart === "type" ? selection.segment : null;

  function selectSegment(segment: string) {
    if (selection?.chart === "type" && selection.segment === segment) {
      onSelect(null);
      return;
    }
    onSelect({ chart: "type", segment });
  }

  return (
    <Card className="border-border/80 shadow-none">
      <CardHeader className="pb-1">
        <CardTitle className="card-title-serif">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pb-5">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={sorted}
            layout="vertical"
            margin={{ top: 0, right: 28, left: 4, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={{ fontSize: 11, fill: "#71717a" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip />
            <Bar
              dataKey="value"
              radius={[0, 3, 3, 0]}
              barSize={14}
              cursor="pointer"
              onClick={(data) => {
                const segment = (data as { name?: string })?.name;
                if (segment) selectSegment(segment);
              }}
            >
              {sorted.map((entry) => (
                <Cell
                  key={entry.name}
                  fill="#1e3a5f"
                  fillOpacity={
                    activeSegment && activeSegment !== entry.name ? 0.28 : 1
                  }
                />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                className="fill-muted-foreground"
                style={{ fontSize: 11, fontWeight: 500 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface PipelineChartProps {
  title: string;
  description?: string;
  data: { name: string; value: number; color: string }[];
  selection: ChartSelection;
  onSelect: (selection: ChartSelection) => void;
}

export function PipelineChart({
  title,
  description,
  data,
  selection,
  onSelect,
}: PipelineChartProps) {
  const activeSegment = selection?.chart === "pipeline" ? selection.segment : null;

  function selectSegment(segment: string) {
    if (selection?.chart === "pipeline" && selection.segment === segment) {
      onSelect(null);
      return;
    }
    onSelect({ chart: "pipeline", segment });
  }

  return (
    <Card className="border-border/80 shadow-none">
      <CardHeader className="pb-1">
        <CardTitle className="card-title-serif">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pb-5">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 18, right: 8, left: -16, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "#71717a" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#a1a1aa" }}
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip />
            <Bar
              dataKey="value"
              radius={[3, 3, 0, 0]}
              barSize={36}
              cursor="pointer"
              onClick={(data) => {
                const segment = (data as { name?: string })?.name;
                if (segment) selectSegment(segment);
              }}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                  fillOpacity={
                    activeSegment && activeSegment !== entry.name ? 0.28 : 1
                  }
                  stroke={activeSegment === entry.name ? "#0f172a" : "none"}
                  strokeWidth={activeSegment === entry.name ? 1 : 0}
                />
              ))}
              <LabelList
                dataKey="value"
                position="top"
                className="fill-muted-foreground"
                style={{ fontSize: 11, fontWeight: 500 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
