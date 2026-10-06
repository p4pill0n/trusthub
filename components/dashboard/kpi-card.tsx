import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, Calendar } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  variant?: "default" | "warning" | "danger";
  icon?: LucideIcon;
  href?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  variant = "default",
  icon: Icon,
  href,
}: KpiCardProps) {
  const defaultIcon =
    variant === "danger" ? AlertTriangle : variant === "warning" ? Clock : null;

  const StatusIcon = Icon ?? defaultIcon;

  const card = (
    <Card
      className={cn(
        "h-full border-border/80 shadow-none",
        href && "transition-colors hover:border-foreground/30"
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {title}
          </p>
          {StatusIcon && (
            <StatusIcon
              className={cn(
                "h-4 w-4 shrink-0",
                variant === "warning" && "text-amber-500",
                variant === "danger" && "text-red-500"
              )}
            />
          )}
          {!StatusIcon && variant === "default" && title.toLowerCase().includes("90") && (
            <Calendar className="h-4 w-4 shrink-0 text-muted-foreground/60" />
          )}
        </div>
        <p
          className={cn(
            "mt-2 font-serif text-4xl font-normal tracking-tight",
            variant === "warning" && "text-foreground",
            variant === "danger" && "text-foreground"
          )}
        >
          {value}
        </p>
        {subtitle && (
          <p className="mt-1.5 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );

  if (!href) return card;
  return (
    <Link href={href} className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {card}
    </Link>
  );
}
