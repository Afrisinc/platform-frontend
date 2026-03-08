import { Bell, Users, CreditCard, BarChart3, ArrowRight, TrendingUp, Activity, Zap, Clock } from "lucide-react";
import { usePlatform } from "@/contexts/PlatformContext";

const iconMap: Record<string, React.ElementType> = {
  Bell, Users, CreditCard, BarChart3,
};

const stats = [
  { label: "Total API Calls", value: "1.2M", change: "+12.5%", icon: Zap },
  { label: "Active Users", value: "3,847", change: "+5.2%", icon: Users },
  { label: "Revenue (MRR)", value: "$48.2K", change: "+8.1%", icon: TrendingUp },
  { label: "Uptime", value: "99.98%", change: "+0.02%", icon: Activity },
];

const activities = [
  { action: "New member invited", detail: "sarah@afrisinc.com joined Afrisinc Ltd", time: "2 min ago" },
  { action: "Notify campaign sent", detail: "Welcome Series — 12,400 recipients", time: "1 hour ago" },
  { action: "API key rotated", detail: "Production key updated by admin", time: "3 hours ago" },
  { action: "Billing updated", detail: "Plan upgraded to Enterprise", time: "1 day ago" },
  { action: "CRM sync completed", detail: "2,340 contacts imported", time: "2 days ago" },
];

export default function Dashboard() {
  const { currentWorkspace, products, setCurrentProduct, currentProduct } = usePlatform();

  if (currentProduct) {
    return <ProductDashboard />;
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, John</h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening at <span className="font-medium text-foreground">{currentWorkspace.name}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">{s.label}</span>
              <div className="p-2 rounded-lg bg-accent">
                <s.icon className="h-4 w-4 text-accent-foreground" />
              </div>
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <span className="text-xs font-medium text-success mt-1 inline-block">{s.change} this month</span>
          </div>
        ))}
      </div>

      {/* Products */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Products</h2>
          <button className="text-sm text-primary font-medium hover:underline">View all</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((p) => {
            const Icon = iconMap[p.icon];
            return (
              <button
                key={p.id}
                onClick={() => setCurrentProduct(p)}
                className="bg-card rounded-xl border border-border p-5 text-left hover:shadow-md hover:border-primary/30 transition-all group"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: `hsl(${p.color} / 0.12)`, color: `hsl(${p.color})` }}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                </div>
                <h3 className="font-semibold mb-1">{p.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{p.description}</p>
                <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                  Open <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <button className="text-sm text-primary font-medium hover:underline">View all</button>
        </div>
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          {activities.map((a, i) => (
            <div key={i} className="flex items-start gap-4 p-4">
              <div className="p-2 rounded-lg bg-accent shrink-0 mt-0.5">
                <Clock className="h-3.5 w-3.5 text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{a.action}</p>
                <p className="text-sm text-muted-foreground truncate">{a.detail}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductDashboard() {
  const { currentProduct } = usePlatform();
  if (!currentProduct) return null;

  const productStats = [
    { label: "Sent Today", value: "24.5K", change: "+18%" },
    { label: "Delivered", value: "99.2%", change: "+0.3%" },
    { label: "Open Rate", value: "34.8%", change: "+2.1%" },
    { label: "Click Rate", value: "12.4%", change: "+1.8%" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{currentProduct.name} Dashboard</h1>
        <p className="text-muted-foreground mt-1">{currentProduct.description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {productStats.map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-5">
            <span className="text-sm text-muted-foreground font-medium">{s.label}</span>
            <div className="text-2xl font-bold mt-2">{s.value}</div>
            <span className="text-xs font-medium text-success mt-1 inline-block">{s.change}</span>
          </div>
        ))}
      </div>

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
