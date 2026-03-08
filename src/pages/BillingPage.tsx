import { CreditCard, Download, CheckCircle2, Receipt, Package, ArrowUpRight } from "lucide-react";
import { usePlatform } from "@/contexts/PlatformContext";

const PRODUCT_SUBSCRIPTIONS = [
  { productId: "notify", name: "Notify", plan: "Pro", price: 19, status: "active" as const, color: "202 97% 45%" },
  { productId: "crm", name: "CRM", plan: "Starter", price: 15, status: "active" as const, color: "152 60% 42%" },
  { productId: "billing", name: "Billing", plan: "Pro", price: 15, status: "active" as const, color: "38 92% 50%" },
];

export default function BillingPage() {
  const { currentWorkspace, invoices } = usePlatform();
  const totalMonthly = PRODUCT_SUBSCRIPTIONS.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground mt-1">Manage your workspace billing and subscriptions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Plan Summary */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Workspace Billing</h2>
              <p className="text-3xl font-bold">${totalMonthly}<span className="text-lg text-muted-foreground font-normal">/month</span></p>
              <p className="text-sm text-muted-foreground mt-1">{PRODUCT_SUBSCRIPTIONS.length} active product subscriptions</p>
            </div>
            <button className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
              Manage Plans
            </button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Payment Method</h2>
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-4 mb-4">
            <div className="p-2 rounded-lg bg-card border border-border">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Visa •••• 4242</p>
              <p className="text-xs text-muted-foreground">Expires 12/2026</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
            Update Payment Method
          </button>
        </div>
      </div>

      {/* Per-Product Subscriptions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Product Subscriptions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRODUCT_SUBSCRIPTIONS.map((sub) => (
            <div key={sub.productId} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `hsl(${sub.color} / 0.12)` }}>
                  <Package className="h-5 w-5" style={{ color: `hsl(${sub.color})` }} />
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-success/10 text-success font-medium capitalize">
                  {sub.status}
                </span>
              </div>
              <h3 className="font-semibold">{sub.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{sub.plan} Plan</p>
              <div className="flex items-end justify-between">
                <p className="text-xl font-bold">${sub.price}<span className="text-sm text-muted-foreground font-normal">/mo</span></p>
                <button className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                  Change <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Billing History</h2>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left font-medium text-muted-foreground px-5 py-3">Invoice</th>
                  <th className="text-left font-medium text-muted-foreground px-5 py-3">Amount</th>
                  <th className="text-left font-medium text-muted-foreground px-5 py-3">Status</th>
                  <th className="text-left font-medium text-muted-foreground px-5 py-3">Date</th>
                  <th className="text-right font-medium text-muted-foreground px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{inv.id}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium">{inv.amount}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${inv.status === "Paid" ? "bg-success/10 text-success" : inv.status === "Pending" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground" title="Download invoice">
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
