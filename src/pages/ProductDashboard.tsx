import { usePlatform } from "@/contexts/PlatformContext";

interface ProductDashboardProps {
  productId?: string;
}

export default function ProductDashboard({ productId }: ProductDashboardProps) {
  const { products, currentWorkspace } = usePlatform();
  const product = products.find((p) => p.id === productId);

  if (!product) return null;

  const productStats = [
    { label: "Sent Today", value: "24.5K", change: "+18%" },
    { label: "Delivered", value: "99.2%", change: "+0.3%" },
    { label: "Open Rate", value: "34.8%", change: "+2.1%" },
    { label: "Click Rate", value: "12.4%", change: "+1.8%" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span>{currentWorkspace.name}</span>
          <span>/</span>
          <span className="text-foreground font-medium">{product.name}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{product.name} Dashboard</h1>
        <p className="text-muted-foreground mt-1">{product.description}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {productStats.map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
            <span className="text-sm text-muted-foreground font-medium">{s.label}</span>
            <div className="text-2xl font-bold mt-2">{s.value}</div>
            <span className="text-xs font-medium text-success mt-1 inline-block">{s.change}</span>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4">Delivery Overview</h3>
          <div className="space-y-3">
            {[
              { label: "Email", pct: 85 },
              { label: "SMS", pct: 72 },
              { label: "Push", pct: 91 },
            ].map((ch) => (
              <div key={ch.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{ch.label}</span>
                  <span className="font-medium">{ch.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${ch.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4">Recent Campaigns</h3>
          <div className="space-y-3">
            {[
              { name: "Welcome Series", status: "Active", sent: "12.4K" },
              { name: "Product Update v2.1", status: "Completed", sent: "8.2K" },
              { name: "Black Friday Promo", status: "Scheduled", sent: "—" },
            ].map((c) => (
              <div key={c.name} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.sent} sent</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  c.status === "Active" ? "bg-success/10 text-success" :
                  c.status === "Completed" ? "bg-accent text-accent-foreground" :
                  "bg-warning/10 text-warning"
                }`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
