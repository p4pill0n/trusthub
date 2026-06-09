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
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RISK_COLORS } from "@/lib/utils";

interface DonutChartProps {
  title: string;
  description?: string;
  data: { name: string; value: number; color?: string }[];
}

export function DonutChart({ title, description, data }: DonutChartProps) {
  const colors = [
    RISK_COLORS.Low,
    RISK_COLORS.Medium,
    RISK_COLORS.High,
    RISK_COLORS["Very High"],
  ];

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
              data={data.filter((d) => d.value > 0)}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={entry.color ?? colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-1.5 text-xs">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color ?? colors[index % colors.length] }}
              />
              <span className="text-muted-foreground">{entry.name}</span>
              <span className="font-medium text-foreground">{entry.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface VendorTypesChartProps {
  title: string;
  description?: string;
  data: { name: string; value: number }[];
}

export function VendorTypesChart({ title, description, data }: VendorTypesChartProps) {
  const sorted = [...data].sort((a, b) => b.value - a.value);

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
            margin={{ top: 0, right: 16, left: 4, bottom: 0 }}
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
            <Bar dataKey="value" fill="#1e3a5f" radius={[0, 3, 3, 0]} barSize={14} />
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
}

export function PipelineChart({ title, description, data }: PipelineChartProps) {
  return (
    <Card className="border-border/80 shadow-none">
      <CardHeader className="pb-1">
        <CardTitle className="card-title-serif">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pb-5">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "#71717a" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} allowDecimals={false} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="value" radius={[3, 3, 0, 0]} barSize={36}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
