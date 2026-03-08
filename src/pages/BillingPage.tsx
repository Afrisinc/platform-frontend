import { CreditCard, Download, CheckCircle2, Receipt } from "lucide-react";
import { usePlatform } from "@/contexts/PlatformContext";

export default function BillingPage() {
  const { currentWorkspace, products, invoices } = usePlatform();
  const activeProducts = products.filter((p) => p.active);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground mt-1">Manage your workspace billing and subscription.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Plan */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Current Plan</h2>
              <p className="text-3xl font-bold">{currentWorkspace.plan} Plan</p>
              <p className="text-lg text-muted-foreground mt-1">$49<span className="text-sm">/month</span></p>
            </div>
            <button className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
              Upgrade Plan
            </button>
          </div>
          <div>
            <p className="text-sm font-medium mb-3">Products Included</p>
            <div className="flex flex-wrap gap-2">
              {activeProducts.map((p) => (
                <span key={p.id} className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-accent text-accent-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {p.name}
                </span>
              ))}
            </div>
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
