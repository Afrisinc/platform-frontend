import { DollarSign, CreditCard, TrendingUp, AlertCircle, Info, AlertTriangle, Package } from "lucide-react";
import { useBillingOverview } from "@/hooks/useBilling";
import { usePlatform } from "@/contexts/PlatformContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function BillingOverviewTab() {
  const { currentWorkspace } = usePlatform();
  const { data, isLoading } = useBillingOverview(currentWorkspace.id);

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  const alertIcon = { info: Info, warning: AlertTriangle, error: AlertCircle };

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {data.alerts.map((a) => {
        const Icon = alertIcon[a.type];
        return (
          <div
            key={a.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm ${
              a.type === "info"
                ? "bg-accent/50 border-primary/20 text-accent-foreground"
                : a.type === "warning"
                ? "bg-warning/10 border-warning/30 text-warning"
                : "bg-destructive/10 border-destructive/30 text-destructive"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {a.message}
          </div>
        );
      })}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Estimated Total" value={`$${data.estimatedTotal.toFixed(2)}`} sub="this billing cycle" color="primary" />
        <StatCard icon={Package} label="Subscription Charges" value={`$${data.subscriptionCharges.toFixed(2)}`} sub={`${data.subscriptions.length} active products`} color="success" />
        <StatCard icon={TrendingUp} label="Usage Charges" value={`$${data.usageCharges.toFixed(2)}`} sub="metered billing" color="warning" />
        <StatCard icon={CreditCard} label="Payment Method" value={data.paymentMethod ? `${data.paymentMethod.brand} •••• ${data.paymentMethod.last4}` : "None"} sub={data.paymentMethod ? `Exp ${data.paymentMethod.expMonth}/${data.paymentMethod.expYear}` : "Add a payment method"} color="primary" />
      </div>

      {/* Active Products Breakdown */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Active Products</h3>
        <div className="divide-y divide-border">
          {data.subscriptions.map((sub) => (
            <div key={sub.productId} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `hsl(${sub.color} / 0.12)` }}>
                  <Package className="h-4 w-4" style={{ color: `hsl(${sub.color})` }} />
                </div>
                <div>
                  <p className="text-sm font-medium">{sub.productName}</p>
                  <p className="text-xs text-muted-foreground">{sub.plan} · {sub.billingModel === "seat" ? `${sub.seats} seats` : sub.billingModel}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">${sub.price.toFixed(2)}<span className="text-xs text-muted-foreground font-normal">/mo</span></p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sub.status === "active" ? "bg-success/10 text-success" : sub.status === "trialing" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                  {sub.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Summary */}
      {data.usageSummary.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Usage-Based Charges</h3>
          <div className="space-y-3">
            {data.usageSummary.map((u) => (
              <div key={u.productName} className="flex items-center justify-between">
                <p className="text-sm">{u.productName}</p>
                <p className="text-sm font-semibold">${u.charges.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Invoice */}
      <div className="bg-card rounded-xl border border-border p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Next invoice date</p>
          <p className="text-lg font-semibold">{new Date(data.nextInvoiceDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Estimated amount</p>
          <p className="text-2xl font-bold">${data.estimatedTotal.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: string; sub: string; color: string }) {
  const colorMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}
