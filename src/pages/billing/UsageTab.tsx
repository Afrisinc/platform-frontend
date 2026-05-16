import { BarChart3, TrendingUp } from "lucide-react";
import { useUsageMetrics } from "@/hooks/useBilling";
import { usePlatform } from "@/contexts/PlatformContext";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function UsageTab() {
  const { currentWorkspace } = usePlatform();
  const { data: metrics, isLoading } = useUsageMetrics(currentWorkspace.id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!metrics?.length) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-1">No usage data</h3>
        <p className="text-sm text-muted-foreground">
          Usage metrics will appear once metered products are active.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {metrics.map((m) => (
        <div key={m.productId} className="bg-card rounded-xl border border-border p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `hsl(${m.color} / 0.12)` }}
                >
                  <TrendingUp className="h-4 w-4" style={{ color: `hsl(${m.color})` }} />
                </div>
                <h3 className="font-semibold">{m.productName}</h3>
              </div>
              <p className="text-xs text-muted-foreground">{m.rateDescription}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">${m.currentCharges.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">current charges</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <MiniStat label={m.metric} value={m.currentValue.toLocaleString()} />
            {m.limit && <MiniStat label="Limit" value={m.limit.toLocaleString()} />}
            {m.limit && (
              <MiniStat label="Used" value={`${((m.currentValue / m.limit) * 100).toFixed(1)}%`} />
            )}
          </div>

          {/* Usage bar (limit-based) */}
          {m.limit && (
            <div className="mb-6">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>
                  {m.currentValue.toLocaleString()} / {m.limit.toLocaleString()} {m.unit}
                </span>
                <span>{((m.currentValue / m.limit) * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min((m.currentValue / m.limit) * 100, 100)}%`,
                    backgroundColor: `hsl(${m.color})`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={m.dailyUsage} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v: string) => v.slice(-2)}
                  className="text-muted-foreground"
                />
                <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelFormatter={(v: string) => `May ${v.slice(-2)}`}
                />
                <Bar dataKey="value" fill={`hsl(${m.color})`} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/50 rounded-lg p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
