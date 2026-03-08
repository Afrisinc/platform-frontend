import {
  LayoutDashboard, Package, Users, Key, CreditCard, Settings,
  Bell, FileText, Send, ScrollText, Webhook,
  PanelLeftClose, PanelLeft
} from "lucide-react";
import { usePlatform } from "@/contexts/PlatformContext";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  icon: React.ElementType;
  active?: boolean;
}

const platformNav: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Products", icon: Package },
  { label: "Members", icon: Users },
  { label: "API Keys", icon: Key },
  { label: "Billing", icon: CreditCard },
  { label: "Settings", icon: Settings },
];

const notifyNav: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Templates", icon: FileText },
  { label: "Campaigns", icon: Send },
  { label: "Logs", icon: ScrollText },
  { label: "Webhooks", icon: Webhook },
  { label: "Settings", icon: Settings },
];

const productNavMap: Record<string, NavItem[]> = {
  notify: notifyNav,
};

export function AppSidebar() {
  const { currentProduct, sidebarCollapsed, setSidebarCollapsed } = usePlatform();
  const navItems = currentProduct ? (productNavMap[currentProduct.id] || platformNav) : platformNav;

  return (
    <aside
      className={cn(
        "h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200 shrink-0",
        sidebarCollapsed ? "w-16" : "w-56"
      )}
    >
      <div className="flex-1 py-3 px-2">
        {!sidebarCollapsed && currentProduct && (
          <div className="px-3 pb-3 mb-1">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">{currentProduct.name}</span>
          </div>
        )}
        <nav className="space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={cn(
                "flex items-center gap-3 w-full rounded-lg text-sm font-medium transition-colors",
                sidebarCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2",
                item.active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex items-center justify-center w-full p-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          {sidebarCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
