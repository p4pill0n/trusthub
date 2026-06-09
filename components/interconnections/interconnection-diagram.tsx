"use client";

import { useMemo } from "react";
import type { Interconnection } from "@/types";

interface InterconnectionDiagramProps {
  interconnections: Interconnection[];
}

export function InterconnectionDiagram({ interconnections }: InterconnectionDiagramProps) {
  const vendors = useMemo(() => {
    const map = new Map<string, string>();
    interconnections.forEach((ic) => {
      const name = ic.vendors?.name ?? "Unknown";
      map.set(ic.vendor_id, name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [interconnections]);

  if (vendors.length === 0) {
    return (
      <div className="rounded-lg border border-border/80 bg-white p-12 text-center text-sm text-muted-foreground">
        No interconnections to display.
      </div>
    );
  }

  const centerX = 300;
  const centerY = 220;
  const radius = 150;

  return (
    <div className="rounded-lg border border-border/80 bg-white p-6">
      <svg viewBox="0 0 600 440" className="mx-auto w-full max-w-3xl">
        {vendors.map((vendor, index) => {
          const angle = (index / vendors.length) * 2 * Math.PI - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          const vendorConnections = interconnections.filter((ic) => ic.vendor_id === vendor.id);

          return (
            <g key={vendor.id}>
              {vendorConnections.map((ic) => (
                <line
                  key={ic.id}
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  stroke={
                    ic.direction === "Inbound"
                      ? "#2563eb"
                      : ic.direction === "Outbound"
                        ? "#ea580c"
                        : "#7c3aed"
                  }
                  strokeWidth={1.5}
                  strokeOpacity={0.5}
                />
              ))}
              <circle cx={x} cy={y} r={36} fill="#f4f4f5" stroke="#e4e4e7" strokeWidth={1} />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground text-[10px] font-medium"
              >
                {vendor.name.length > 12 ? `${vendor.name.slice(0, 11)}…` : vendor.name}
              </text>
            </g>
          );
        })}
        <circle cx={centerX} cy={centerY} r={44} fill="#121212" />
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white text-[11px] font-medium"
        >
          Trust Hub
        </text>
      </svg>
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-blue-600" /> Inbound
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-orange-600" /> Outbound
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-violet-600" /> Bidirectional
        </span>
      </div>
    </div>
  );
}
