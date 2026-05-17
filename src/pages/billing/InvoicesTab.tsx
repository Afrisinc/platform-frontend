import { useState } from "react";
import { Receipt, Download, Eye, X } from "lucide-react";
import { useInvoices } from "@/hooks/useBilling";
import { usePlatform } from "@/contexts/PlatformContext";
import { Skeleton } from "@/components/ui/skeleton";
import type { Invoice } from "@/services/billingService";

export default function InvoicesTab() {
  const { currentWorkspace } = usePlatform();
  const { data: invoices, isLoading } = useInvoices(currentWorkspace.id);
  const [detail, setDetail] = useState<Invoice | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!invoices?.length) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-1">No invoices yet</h3>
        <p className="text-sm text-muted-foreground">
          Invoices will appear after your first billing cycle.
        </p>
      </div>
    );
  }

  const statusStyle = (s: string) =>
    s === "paid"
      ? "bg-success/10 text-success"
      : s === "pending"
        ? "bg-warning/10 text-warning"
        : "bg-destructive/10 text-destructive";

  return (
    <>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left font-medium text-muted-foreground px-5 py-3">Invoice</th>
                <th className="text-left font-medium text-muted-foreground px-5 py-3">Date</th>
                <th className="text-left font-medium text-muted-foreground px-5 py-3">Products</th>
                <th className="text-right font-medium text-muted-foreground px-5 py-3">Amount</th>
                <th className="text-left font-medium text-muted-foreground px-5 py-3">Status</th>
                <th className="text-right font-medium text-muted-foreground px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4 font-medium">#{inv.number}</td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {new Date(inv.date).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {inv.lineItems.map((li) => (
                        <span
                          key={li.product}
                          className="text-xs bg-muted px-2 py-0.5 rounded-full"
                        >
                          {li.product}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold">${inv.total.toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusStyle(inv.status)}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setDetail(inv)}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
                        title="View"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
                        title="Download"
                      >
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

      {/* Detail modal */}
      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
          onClick={() => setDetail(null)}
        >
          <div
            className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Invoice #{detail.number}</h3>
              <button onClick={() => setDetail(null)} className="p-1 rounded-md hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>{new Date(detail.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due</span>
                <span>{new Date(detail.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusStyle(detail.status)}`}
                >
                  {detail.status}
                </span>
              </div>
            </div>
            <div className="border-t border-border pt-4 space-y-2">
              {detail.lineItems.map((li, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{li.product}</p>
                    <p className="text-xs text-muted-foreground">{li.description}</p>
                  </div>
                  <p className="font-medium">${li.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-4 pt-4 flex justify-between font-semibold">
              <span>Total</span>
              <span>${detail.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
