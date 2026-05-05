import {
  LayoutDashboard, Users, Ticket, BarChart3,
  UserCog, Settings2, CreditCard, ClipboardList,
  ShieldCheck, PanelLeftClose, PanelLeft, ChevronRight,
  Bell, Package, BarChart2, Layers,
} from "lucide-react";
import { usePlatform, ControlRole, Permission } from "@/contexts/PlatformContext";
import type { BackendSidebarItem } from "@/lib/platformApi";
import { cn } from "@/lib/utils";

// ── Product icon registry ─────────────────────────────────────────────────────
const PRODUCT_ICONS: Record<string, React.ElementType> = {
  notify:    Bell,
  crm:       Layers,
  payments:  CreditCard,
  analytics: BarChart2,
};

// ── Icon registry for backend sidebar items ───────────────────────────────────
// Maps the `icon` string stored in the DB to a Lucide component.
const ICON_REGISTRY: Record<string, React.ElementType> = {
  LayoutDashboard, Dashboard: LayoutDashboard,
  Users, Customers: Users,
  Ticket, Tickets: Ticket,
  BarChart3, Reports: BarChart3, "Reports & Analytics": BarChart3,
  BarChart2, Analytics: BarChart2,
  UserCog, "User Management": UserCog,
  Settings2, Settings: Settings2,
  CreditCard, Billing: CreditCard, Payments: CreditCard,
  ClipboardList, "Audit Log": ClipboardList,
  ShieldCheck, "Platform Settings": ShieldCheck,
  Bell, Notify: Bell,
  Layers, CRM: Layers,
  Package,
};

/** Derive the frontend page ID from a backend sidebar item's path or label. */
function derivedPageId(item: BackendSidebarItem): string {
  if (item.path) {
    const clean = item.path.replace(/^\/+/, '').toLowerCase();
    const PATH_MAP: Record<string, string> = {
      dashboard:           'dashboard',
      customers:           'customers',
      tickets:             'tickets',
      'support-tickets':   'tickets',
      reports:             'reports',
      'reports-analytics': 'reports',
      'user-management':   'user-management',
      billing:             'billing',
      'audit-log':         'audit-log',
      'platform-settings': 'platform-settings',
      settings:            'settings',
    };
    return PATH_MAP[clean] ?? clean;
  }
  // Fall back to label-derived ID
  return item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ── Static nav config (used when backend sidebar items are unavailable) ───────
interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  permission?: Permission;
  roles?: ControlRole[];
  divider?: boolean;
}

const STATIC_NAV_ITEMS: NavItem[] = [
  { id: "customers",         label: "Customers",           icon: Users,         permission: "view_customers",  divider: true },
  { id: "tickets",           label: "Support Tickets",     icon: Ticket,        permission: "view_tickets" },
  { id: "reports",           label: "Reports & Analytics", icon: BarChart3,     permission: "view_reports",    divider: true },
  { id: "user-management",   label: "User Management",     icon: UserCog,       permission: "manage_users",    divider: true },
  { id: "billing",           label: "Billing",             icon: CreditCard,    permission: "view_billing" },
  { id: "audit-log",         label: "Audit Log",           icon: ClipboardList, permission: "view_audit" },
  { id: "platform-settings", label: "Platform Settings",   icon: ShieldCheck,   roles: ["super_admin"],        divider: true },
  { id: "settings",          label: "Settings",            icon: Settings2,     permission: "configure_product", divider: true },
  // Admin management pages (super_admin only)
  { id: "admin-roles",       label: "Manage Roles",        icon: ShieldCheck,   roles: ["super_admin"] },
  { id: "admin-permissions", label: "Manage Permissions",  icon: ClipboardList, roles: ["super_admin"] },
  { id: "admin-sidebar",     label: "Manage Menus",        icon: Layers,        roles: ["super_admin"] },
];

// ── Reusable nav button ───────────────────────────────────────────────────────
interface NavButtonProps {
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
  divider?: boolean;
  collapsed: boolean;
}

function NavButton({ label, icon: Icon, isActive, onClick, divider, collapsed }: NavButtonProps) {
  return (
    <div>
      {divider && <div className="my-1.5 border-t border-sidebar-border" />}
      <button
        onClick={onClick}
        title={collapsed ? label : undefined}
        className={cn(
          "group relative flex items-center w-full rounded-lg text-sm font-medium transition-all duration-150",
          collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        )}
      >
        <Icon className={cn("shrink-0 transition-colors", collapsed ? "h-5 w-5" : "h-4 w-4")} />
        {!collapsed && <span className="flex-1 text-left">{label}</span>}
        {!collapsed && isActive && <ChevronRight className="h-3 w-3 opacity-50" />}
        {/* Tooltip when collapsed */}
        {collapsed && (
          <span className="absolute left-full ml-2.5 px-2 py-1 rounded-md bg-popover border border-border text-popover-foreground text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
            {label}
          </span>
        )}
      </button>
    </div>
  );
}

// ── Sidebar component ─────────────────────────────────────────────────────────
export function AppSidebar() {
  const {
    currentUser, can, hasProductAccess,
    products, backendSidebarItems,
    sidebarCollapsed, setSidebarCollapsed,
    activePage, setActivePage,
    activeProductId, setActiveProductId, setActiveProductTab,
  } = usePlatform();

  // Products this user can access (Active only)
  const accessibleProducts = products.filter(
    (p) => p.status === "Active" && hasProductAccess(p.id)
  );

  // ── Render backend sidebar items (when available) ─────────────────────────
  function renderBackendItems(items: BackendSidebarItem[]) {
    return items.map((item, idx) => {
      const Icon = ICON_REGISTRY[item.icon ?? ""] ?? ICON_REGISTRY[item.label] ?? Package;
      const pageId = derivedPageId(item);
      const isActive = activePage === pageId;
      const showDivider = idx > 0 && item.order % 10 === 0;

      return (
        <NavButton
          key={item.id}
          label={item.label}
          icon={Icon}
          isActive={isActive}
          onClick={() => setActivePage(pageId)}
          divider={showDivider}
          collapsed={sidebarCollapsed}
        />
      );
    });
  }

  // ── Render static nav items (fallback) ───────────────────────────────────
  function renderStaticItems() {
    const visible = STATIC_NAV_ITEMS.filter((item) => {
      if (item.roles && !item.roles.includes(currentUser.role)) return false;
      if (item.permission && !can(item.permission)) return false;
      return true;
    });

    return visible.map((item) => (
      <NavButton
        key={item.id}
        label={item.label}
        icon={item.icon}
        isActive={activePage === item.id}
        onClick={() => setActivePage(item.id)}
        divider={item.divider}
        collapsed={sidebarCollapsed}
      />
    ));
  }

  return (
    <aside
      className={cn(
        "h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200 shrink-0",
        sidebarCollapsed ? "w-[60px]" : "w-56"
      )}
    >
      <div className="flex-1 py-3 px-2 overflow-y-auto space-y-0.5">

        {/* ── Dashboard (always first) ───────────────────────────────────── */}
        <NavButton
          label="Dashboard"
          icon={LayoutDashboard}
          isActive={activePage === "dashboard"}
          onClick={() => setActivePage("dashboard")}
          collapsed={sidebarCollapsed}
        />

        {/* ── Products (dynamic, always shown regardless of backend items) ─ */}
        {accessibleProducts.length > 0 && (
          <>
            <div className="my-1.5 border-t border-sidebar-border" />
            {!sidebarCollapsed && (
              <p className="px-3 pt-1 pb-0.5 text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                Products
              </p>
            )}
            {accessibleProducts.map((product) => {
              const Icon = PRODUCT_ICONS[product.id] ?? Package;
              const isActive = activePage === "product" && activeProductId === product.id;
              return (
                <NavButton
                  key={product.id}
                  label={product.name}
                  icon={Icon}
                  isActive={isActive}
                  onClick={() => {
                    setActivePage("product");
                    setActiveProductId(product.id);
                    setActiveProductTab("overview");
                  }}
                  collapsed={sidebarCollapsed}
                />
              );
            })}
          </>
        )}

        {/* ── Platform nav items ─────────────────────────────────────────── */}
        {/* Use backend-provided items when available, fall back to static config */}
        {backendSidebarItems && backendSidebarItems.length > 0
          ? renderBackendItems(backendSidebarItems)
          : renderStaticItems()}
      </div>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn(
            "flex items-center w-full rounded-lg p-2 text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors",
            sidebarCollapsed ? "justify-center" : "justify-end"
          )}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
