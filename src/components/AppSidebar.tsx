import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Ticket,
  BarChart3,
  UserCog,
  Settings2,
  CreditCard,
  ClipboardList,
  ShieldCheck,
  PanelLeftClose,
  PanelLeft,
  ChevronRight,
  Bell,
  Package,
  BarChart2,
  Layers,
} from "lucide-react";
import { usePlatform } from "@/contexts/PlatformContext";
import type { BackendSidebarItem } from "@/lib/platformApi";
import { cn } from "@/lib/utils";

// ── Product icon registry ─────────────────────────────────────────────────────
const PRODUCT_ICONS: Record<string, React.ElementType> = {
  notify: Bell,
  crm: Layers,
  payments: CreditCard,
  analytics: BarChart2,
};

// ── Icon registry for backend sidebar items ───────────────────────────────────
// Maps the `icon` string stored in the DB to a Lucide component.
const ICON_REGISTRY: Record<string, React.ElementType> = {
  LayoutDashboard,
  Dashboard: LayoutDashboard,
  Users,
  Customers: Users,
  Ticket,
  Tickets: Ticket,
  BarChart3,
  Reports: BarChart3,
  "Reports & Analytics": BarChart3,
  BarChart2,
  Analytics: BarChart2,
  UserCog,
  "User Management": UserCog,
  Settings2,
  Settings: Settings2,
  CreditCard,
  Billing: CreditCard,
  Payments: CreditCard,
  ClipboardList,
  "Audit Log": ClipboardList,
  ShieldCheck,
  "Platform Settings": ShieldCheck,
  Roles: ShieldCheck,
  Bell,
  Notify: Bell,
  Layers,
  CRM: Layers,
  Package,
};

// ── Backend icon name → registry key mapping ───────────────────────────────
// Converts kebab-case backend icon names to registry keys
const BACKEND_ICON_MAP: Record<string, string> = {
  "layout-dashboard": "Dashboard",
  users: "Users",
  building: "Organization",
  "credit-card": "Billing",
  headphones: "Notify",
  box: "Package",
  settings: "Settings",
  list: "Users",
  shield: "Roles",
  lock: "ShieldCheck",
  info: "Settings",
  "users-group": "Users",
  receipt: "CreditCard",
  repeat: "CreditCard",
  ticket: "Ticket",
  book: "Package",
  sliders: "Settings",
  "shield-alert": "ShieldCheck",
  "file-text": "ClipboardList",
};

function getIconFromBackend(icon?: string): React.ElementType {
  if (!icon) return Package;
  const registryKey = BACKEND_ICON_MAP[icon] || icon;
  return ICON_REGISTRY[registryKey] || ICON_REGISTRY[icon] || Package;
}

// Maps backend item path → frontend page ID.
// Paths are stripped of leading slash and lowercased before lookup.
const PATH_MAP: Record<string, string> = {
  dashboard: "dashboard",
  customers: "customers",
  tickets: "tickets",
  "support-tickets": "tickets",
  reports: "reports",
  "reports-analytics": "reports",
  "user-management": "user-management",
  users: "user-management",
  "all-users": "user-management",
  billing: "billing",
  "billing-service": "billing",
  subscriptions: "billing",
  invoices: "billing",
  "audit-log": "audit-log",
  "platform-settings": "platform-settings",
  system: "platform-settings",
  settings: "settings",
  "organization-info": "organization-info",
  "organization/info": "organization-info", // Handle slash format from backend
  organization: "organization",
  "organization/members": "organization-members", // Handle slash format from backend
  "organization-members": "organization-members",
  members: "organization-members",
  "admin-control": "admin-control",
  "control-centre": "admin-control",
  "admin-roles": "admin-roles",
  roles: "admin-roles",
  "admin-permissions": "admin-permissions",
  permissions: "admin-permissions",
  "admin-sidebar": "admin-sidebar",
  menus: "admin-sidebar",
  // Product labels that appear as sidebar items
  "notification-service": "notifications",
  notifications: "notifications",
  "afrisinc-control": "dashboard",
  "media-service": "media",
  media: "media",
};

/** Derive the frontend page ID from a backend sidebar item's path or label. */
function derivedPageId(item: BackendSidebarItem): string {
  if (item.path) {
    const clean = item.path.replace(/^\/+/, "").toLowerCase();
    return PATH_MAP[clean] ?? clean;
  }
  if (!item.label) return item.id ?? "unknown";
  return item.label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ── Reusable nav button ───────────────────────────────────────────────────────
interface NavButtonProps {
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
  divider?: boolean;
  collapsed: boolean;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  indent?: number;
}

function NavButton({
  label,
  icon: Icon,
  isActive,
  onClick,
  divider,
  collapsed,
  hasChildren,
  isExpanded,
  onToggleExpand,
  indent = 0,
}: NavButtonProps) {
  const handleClick = () => {
    // Parent items (with children) in expanded sidebar: toggle expand/collapse
    if (hasChildren && !collapsed) {
      onToggleExpand?.();
    }
    // Leaf items or collapsed sidebar: navigate
    else if (!hasChildren) {
      onClick();
    }
    // Parent items in collapsed sidebar: don't do anything (user should expand first)
  };

  return (
    <div>
      {divider && <div className="my-1.5 border-t border-sidebar-border" />}
      <button
        onClick={handleClick}
        title={collapsed ? label : undefined}
        className={cn(
          "group relative flex items-center w-full rounded-lg text-sm font-medium transition-all duration-150",
          collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2",
          isActive && !hasChildren
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        )}
        style={!collapsed && indent ? { paddingLeft: `${12 + indent * 12}px` } : undefined}
      >
        <Icon className={cn("shrink-0 transition-colors", collapsed ? "h-5 w-5" : "h-4 w-4")} />
        {!collapsed && <span className="flex-1 text-left">{label}</span>}
        {!collapsed && hasChildren && (
          <ChevronRight
            className={cn("h-3 w-3 opacity-50 transition-transform", isExpanded && "rotate-90")}
          />
        )}
        {!collapsed && !hasChildren && isActive && <ChevronRight className="h-3 w-3 opacity-50" />}
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
  const navigate = useNavigate();
  const {
    hasProductAccess,
    products,
    backendSidebarItems,
    sidebarCollapsed,
    setSidebarCollapsed,
    activePage,
    setActivePage,
    activeProductId,
    setActiveProductId,
    setActiveProductTab,
  } = usePlatform();

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Products this user can access (Active only)
  const accessibleProducts = products.filter(
    (p) => p.status === "Active" && hasProductAccess(p.id)
  );

  // ── Toggle expand/collapse for parent items ────────────────────────────
  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  // ── Recursive item renderer (handles parent + children) ──────────────────
  function renderSidebarItem(
    item: BackendSidebarItem,
    idx: number,
    indent: number = 0
  ): React.ReactNode {
    const Icon = getIconFromBackend(item.icon);
    const pageId = derivedPageId(item);
    const isActive = activePage === pageId;
    const hasChildren = (item.children?.length ?? 0) > 0;
    const isExpanded = expandedItems.has(item.id);
    const showDivider = idx > 0 && (item.order ?? 0) % 10 === 0;

    return (
      <div key={item.id}>
        <NavButton
          label={item.label ?? item.path ?? pageId}
          icon={Icon}
          isActive={isActive && !hasChildren}
          onClick={() => {
            // Only navigate if it's a leaf item (no children)
            if (!hasChildren && item.path) {
              navigate(item.path);
              setActivePage(pageId);
            }
          }}
          divider={showDivider}
          collapsed={sidebarCollapsed}
          hasChildren={hasChildren}
          isExpanded={isExpanded}
          onToggleExpand={() => toggleExpanded(item.id)}
          indent={indent}
        />
        {hasChildren && isExpanded && !sidebarCollapsed && (
          <div className="space-y-0.5">
            {item.children!.map((child, childIdx) =>
              renderSidebarItem(child, childIdx, indent + 1)
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Render backend sidebar items (when available) ─────────────────────────
  function renderBackendItems(items: BackendSidebarItem[]) {
    return items
      .filter((item) => item.isActive !== false && (item.label || item.path) && !item.parentId)
      .map((item, idx) => renderSidebarItem(item, idx));
  }

  return (
    <aside
      className={cn(
        "h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200 shrink-0",
        sidebarCollapsed ? "w-[60px]" : "w-56"
      )}
    >
      {/* ── Logo header ────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "flex items-center justify-center border-b border-sidebar-border py-3",
          sidebarCollapsed ? "px-2" : "px-3"
        )}
      >
        <img
          src="/afrisic-logo.png"
          alt="Afrisinc"
          className={cn("rounded-lg shadow-sm", sidebarCollapsed ? "w-8 h-8" : "w-10 h-10")}
        />
      </div>

      <div className="flex-1 py-3 px-2 overflow-y-auto space-y-0.5">
        {/* ── Dashboard (always first) ───────────────────────────────────── */}
        <NavButton
          label="Dashboard"
          icon={LayoutDashboard}
          isActive={activePage === "dashboard"}
          onClick={() => {
            navigate("/dashboard");
            setActivePage("dashboard");
          }}
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
                    navigate(`/product/${product.id}`);
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
        {backendSidebarItems &&
          backendSidebarItems.length > 0 &&
          renderBackendItems(backendSidebarItems)}
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
