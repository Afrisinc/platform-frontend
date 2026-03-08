import {
  LayoutDashboard, Package, Users, Key, CreditCard, Settings,
  PanelLeftClose, PanelLeft
} from "lucide-react";
import { usePlatform } from "@/contexts/PlatformContext";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const platformNav: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "members", label: "Members", icon: Users },
  { id: "api-keys", label: "API Keys", icon: Key },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const { sidebarCollapsed, setSidebarCollapsed, activePage, setActivePage } = usePlatform();

  return (
    <aside
      className={cn(
        "h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200 shrink-0",
        sidebarCollapsed ? "w-16" : "w-56"
      )}
    >
      <div className="flex-1 py-3 px-2">
        <nav className="space-y-0.5">
          {platformNav.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={cn(
                "flex items-center gap-3 w-full rounded-lg text-sm font-medium transition-colors",
                sidebarCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2",
                activePage === item.id
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
