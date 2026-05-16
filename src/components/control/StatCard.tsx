import { ElementType } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type ChangeType = "positive" | "negative" | "neutral";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ElementType;
  change?: string;
  changeType?: ChangeType;
  /** Extra Tailwind classes for the icon container background, e.g. "bg-accent" */
  iconBg?: string;
  /** Extra Tailwind classes for the icon color, e.g. "text-accent-foreground" */
  iconColor?: string;
  className?: string;
}

/**
 * StatCard — Metric display card used on dashboards and overview sections.
 * Shows a label, large value, optional icon, and an optional delta/change badge.
 *
 * Usage:
 *   <StatCard label="Open Tickets" value={12} icon={Ticket} change="+3 today" changeType="negative" />
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  change,
  changeType = "neutral",
  iconBg = "bg-accent",
  iconColor = "text-accent-foreground",
  className,
}: StatCardProps) {
  const changeColors: Record<ChangeType, string> = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  };

  const ChangeIcon =
    changeType === "positive" ? TrendingUp : changeType === "negative" ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className={cn("p-2 rounded-lg", iconBg)}>
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      {change && (
        <div className={cn("flex items-center gap-1 mt-1.5", changeColors[changeType])}>
          <ChangeIcon className="h-3 w-3" />
          <span className="text-xs font-medium">{change}</span>
        </div>
      )}
    </div>
  );
}
