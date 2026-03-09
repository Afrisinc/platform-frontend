import { useState } from "react";
import { Package, ArrowUpRight, X } from "lucide-react";
import { useSubscriptions, useChangePlan, useCancelSubscription, usePlanOptions } from "@/hooks/useBilling";
import { usePlatform } from "@/contexts/PlatformContext";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductSubscription } from "@/services/billingService";

export default function SubscriptionsTab() {
  const { currentWorkspace } = usePlatform();
  const { data: subs, isLoading } = useSubscriptions(currentWorkspace.id);
  const changePlan = useChangePlan(currentWorkspace.id);
  const cancelSub = useCancelSubscription(currentWorkspace.id);
  const [changingProduct, setChangingProduct] = useState<string | null>(null);

  if (isLoading) {
    return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>;
  }

  if (!subs?.length) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-1">No active subscriptions</h3>
        <p className="text-sm text-muted-foreground">Activate a product from the Products page to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left font-medium text-muted-foreground px-5 py-3">Product</th>
                <th className="text-left font-medium text-muted-foreground px-5 py-3">Plan</th>
                <th className="text-left font-medium text-muted-foreground px-5 py-3">Billing</th>
                <th className="text-left font-medium text-muted-foreground px-5 py-3">Status</th>
                <th className="text-right font-medium text-muted-foreground px-5 py-3">Cost</th>
                <th className="text-right font-medium text-muted-foreground px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subs.map((sub) => (
                <SubscriptionRow
                  key={sub.productId}
                  sub={sub}
                  onChangePlan={() => setChangingProduct(sub.productId)}
                  onCancel={() => cancelSub.mutate(sub.productId)}
                  canceling={cancelSub.isPending}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan change modal */}
      {changingProduct && (
        <PlanChangeModal
          productId={changingProduct}
          currentPlan={subs.find((s) => s.productId === changingProduct)?.plan ?? ""}
          onClose={() => setChangingProduct(null)}
          onSelect={(planId) => {
            changePlan.mutate({ productId: changingProduct, planId });
            setChangingProduct(null);
          }}
        />
      )}
    </div>
  );
}

function SubscriptionRow({ sub, onChangePlan, onCancel, canceling }: { sub: ProductSubscription; onChangePlan: () => void; onCancel: () => void; canceling: boolean }) {
  const costLabel = sub.billingModel === "seat" ? `$${sub.pricePerSeat}/user × ${sub.seats}` : `$${sub.price.toFixed(2)}/mo`;

  return (
    <tr className="hover:bg-muted/20 transition-colors">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `hsl(${sub.color} / 0.12)` }}>
            <Package className="h-4 w-4" style={{ color: `hsl(${sub.color})` }} />
          </div>
          <span className="font-medium">{sub.productName}</span>
        </div>
      </td>
      <td className="px-5 py-4">{sub.plan}</td>
      <td className="px-5 py-4 capitalize">{sub.billingCycle} · {sub.billingModel}</td>
      <td className="px-5 py-4">
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${sub.status === "active" ? "bg-success/10 text-success" : sub.status === "trialing" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
          {sub.status}
        </span>
      </td>
      <td className="px-5 py-4 text-right font-semibold">{costLabel}</td>
      <td className="px-5 py-4">
        <div className="flex justify-end gap-2">
          <button onClick={onChangePlan} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">Change <ArrowUpRight className="h-3 w-3" /></button>
          <button onClick={onCancel} disabled={canceling} className="text-xs text-destructive font-medium hover:underline disabled:opacity-50">Cancel</button>
        </div>
      </td>
    </tr>
  );
}

function PlanChangeModal({ productId, currentPlan, onClose, onSelect }: { productId: string; currentPlan: string; onClose: () => void; onSelect: (planId: string) => void }) {
  const { data: plans, isLoading } = usePlanOptions(productId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Change Plan</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
        ) : (
          <div className="space-y-3">
            {plans?.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-lg border p-4 cursor-pointer transition-colors ${plan.name.toLowerCase() === currentPlan.toLowerCase() ? "border-primary bg-accent/50" : "border-border hover:border-primary/50"}`}
                onClick={() => onSelect(plan.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{plan.name}</h4>
                  <p className="font-bold">{plan.price === 0 ? "Free" : `$${plan.price}/mo`}</p>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {plan.features.map((f) => <li key={f}>• {f}</li>)}
                </ul>
                {plan.name.toLowerCase() === currentPlan.toLowerCase() && (
                  <span className="text-xs text-primary font-medium mt-2 block">Current plan</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
