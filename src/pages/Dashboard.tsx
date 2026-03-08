import { Users, Zap, TrendingUp, Package, Clock, ExternalLink, UserPlus, Key, Bell, CreditCard, BarChart3 } from "lucide-react";
import { usePlatform } from "@/contexts/PlatformContext";

const iconMap: Record<string, React.ElementType> = { Bell, Users, CreditCard, BarChart3 };

export default function Dashboard() {
  const { currentWorkspace, products, members, activities } = usePlatform();
  const activeProducts = products.filter((p) => p.active);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, John</h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening at <span className="font-medium text-foreground">{currentWorkspace.name}</span>
        </p>
      </div>

      {/* Workspace Overview */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Workspace Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Workspace</p>
            <p className="text-lg font-semibold">{currentWorkspace.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Owner</p>
            <p className="text-lg font-semibold">{currentWorkspace.owner}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Created</p>
            <p className="text-lg font-semibold">{new Date(currentWorkspace.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "API Requests", value: "1.2M", icon: Zap, change: "+12.5%" },
          { label: "Active Members", value: String(members.filter(m => m.status === "Active").length), icon: Users, change: "+2" },
          { label: "Active Products", value: String(activeProducts.length), icon: Package, change: "3 of 4" },
          { label: "Monthly Revenue", value: "$48.2K", icon: TrendingUp, change: "+8.1%" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">{s.label}</span>
              <div className="p-2 rounded-lg bg-accent">
                <s.icon className="h-4 w-4 text-accent-foreground" />
              </div>
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <span className="text-xs font-medium text-success mt-1 inline-block">{s.change}</span>
          </div>
        ))}
      </div>

      {/* Active Products */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Active Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeProducts.map((p) => {
            const Icon = iconMap[p.icon];
            return (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card rounded-xl border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all group block"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `hsl(${p.color} / 0.12)`, color: `hsl(${p.color})` }}>
                  {Icon && <Icon className="h-5 w-5" />}
                </div>
                <h3 className="font-semibold mb-1">{p.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{p.description}</p>
                <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                  Open product <ExternalLink className="h-3.5 w-3.5" />
                </span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Team + Activity side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Summary */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Team Members</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-3xl font-bold">{members.length}</div>
            <div className="text-sm text-muted-foreground">
              <p>{members.filter(m => m.status === "Active").length} active</p>
              <p>{members.filter(m => m.status === "Pending").length} pending</p>
            </div>
          </div>
          <div className="flex -space-x-2">
            {members.slice(0, 5).map((m) => (
              <div key={m.id} className="w-8 h-8 rounded-full bg-primary-pale border-2 border-card flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary">{m.avatar}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {activities.slice(0, 4).map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="p-1.5 rounded-md bg-accent shrink-0 mt-0.5">
                  <Clock className="h-3 w-3 text-accent-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{a.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <a href="https://notify.afrisinc.com/app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Bell className="h-4 w-4" /> Open Notify
          </a>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
            <UserPlus className="h-4 w-4" /> Invite Member
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
            <Key className="h-4 w-4" /> Create API Key
          </button>
        </div>
      </div>
    </div>
  );
}
