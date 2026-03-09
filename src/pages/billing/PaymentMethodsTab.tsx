import { useState } from "react";
import { CreditCard, Plus, Star, Trash2, X, Building, Smartphone } from "lucide-react";
import { usePaymentMethods, useAddPaymentMethod, useRemovePaymentMethod, useSetDefaultPaymentMethod } from "@/hooks/useBilling";
import { usePlatform } from "@/contexts/PlatformContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentMethodsTab() {
  const { currentWorkspace } = usePlatform();
  const { data: methods, isLoading } = usePaymentMethods(currentWorkspace.id);
  const addPM = useAddPaymentMethod(currentWorkspace.id);
  const removePM = useRemovePaymentMethod(currentWorkspace.id);
  const setDefault = useSetDefaultPaymentMethod(currentWorkspace.id);
  const [showAdd, setShowAdd] = useState(false);

  if (isLoading) {
    return <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>;
  }

  const typeIcon = { card: CreditCard, bank: Building, mobile_money: Smartphone };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Add Payment Method
        </button>
      </div>

      {!methods?.length ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">No payment methods</h3>
          <p className="text-sm text-muted-foreground">Add a payment method to start billing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {methods.map((pm) => {
            const Icon = typeIcon[pm.type] ?? CreditCard;
            return (
              <div key={pm.id} className={`bg-card rounded-xl border p-5 transition-shadow hover:shadow-md ${pm.isDefault ? "border-primary" : "border-border"}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${pm.isDefault ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{pm.brand} •••• {pm.last4}</p>
                      {pm.expMonth && <p className="text-xs text-muted-foreground">Expires {pm.expMonth}/{pm.expYear}</p>}
                    </div>
                  </div>
                  {pm.isDefault && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Default</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-4">Added {new Date(pm.addedAt).toLocaleDateString()}</p>
                <div className="flex gap-2">
                  {!pm.isDefault && (
                    <button onClick={() => setDefault.mutate(pm.id)} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                      <Star className="h-3 w-3" /> Set default
                    </button>
                  )}
                  <button onClick={() => removePM.mutate(pm.id)} className="flex items-center gap-1 text-xs font-medium text-destructive hover:underline ml-auto">
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Future support notice */}
      <div className="bg-muted/50 rounded-lg border border-border p-4 flex items-center gap-3">
        <Smartphone className="h-5 w-5 text-muted-foreground shrink-0" />
        <div>
          <p className="text-sm font-medium">Mobile Money support coming soon</p>
          <p className="text-xs text-muted-foreground">We're working on adding MTN MoMo, Airtel Money, and more.</p>
        </div>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Add Payment Method</h3>
              <button onClick={() => setShowAdd(false)} className="p-1 rounded-md hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Card number</label>
                <input className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" placeholder="4242 4242 4242 4242" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Expiry</label>
                  <input className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" placeholder="MM/YY" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">CVC</label>
                  <input className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" placeholder="123" />
                </div>
              </div>
              <button
                onClick={() => { addPM.mutate({ token: "tok_mock" }); setShowAdd(false); }}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Add Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
