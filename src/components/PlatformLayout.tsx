import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { TopNavBar } from "./TopNavBar";
import { AppSidebar } from "./AppSidebar";
import { AdminGuard } from "./admin/AdminGuard";
import { PlatformProvider, usePlatform } from "@/contexts/PlatformContext";
import Dashboard from "@/pages/Dashboard";
import CustomersPage from "@/pages/CustomersPage";
import SupportTicketsPage from "@/pages/SupportTicketsPage";
import ReportsPage from "@/pages/ReportsPage";
import UserManagementPage from "@/pages/UserManagementPage";
import AuditLogPage from "@/pages/AuditLogPage";
import PlatformSettingsPage from "@/pages/PlatformSettingsPage";
import ProductModule from "@/pages/products/ProductModule";
import BillingPage from "@/pages/BillingPage";
import SettingsPage from "@/pages/SettingsPage";
import MembersPage from "@/pages/MembersPage";
import RoleManagementPage from "@/pages/admin/RoleManagementPage";
import PermissionManagementPage from "@/pages/admin/PermissionManagementPage";
import SidebarManagementPage from "@/pages/admin/SidebarManagementPage";
import SuperAdminDashboard from "@/pages/admin/SuperAdminDashboard";

// ── Page routing ──────────────────────────────────────────────────────────────
function PageRenderer() {
  const location = useLocation();
  const { activePage, setActivePage, activeProductId, currentUser, can, hasProductAccess } =
    usePlatform();

  // Sync URL to activePage: when URL changes (direct visit, browser back/forward), update activePage
  useEffect(() => {
    const pathname = location.pathname;

    // Root path → dashboard
    if (pathname === "/") {
      setActivePage("dashboard");
      return;
    }

    // Product path: /product/:id → product page with activeProductId
    const productMatch = pathname.match(/^\/product\/([a-zA-Z0-9-]+)$/);
    if (productMatch) {
      setActivePage("product");
      return;
    }

    // Convert pathname to pageId by removing leading slash
    // e.g., "/organization/members" → "organization/members" → look up in PATH_MAP
    const cleanPath = pathname.replace(/^\//, "").toLowerCase();

    // Create reverse PATH_MAP for URL → pageId lookup
    const PATH_TO_PAGE_ID: Record<string, string> = {
      dashboard: "dashboard",
      "organization/members": "organization-members",
      "organization-members": "organization-members",
      "organization/info": "organization-info",
      "organization-info": "organization-info",
      customers: "customers",
      tickets: "tickets",
      reports: "reports",
      "user-management": "user-management",
      billing: "billing",
      "audit-log": "audit-log",
      "platform-settings": "platform-settings",
      settings: "settings",
      "admin-control": "admin-control",
      "admin-roles": "admin-roles",
      "admin-permissions": "admin-permissions",
      "admin-sidebar": "admin-sidebar",
    };

    const pageId = PATH_TO_PAGE_ID[cleanPath] || cleanPath;
    if (activePage !== pageId) {
      setActivePage(pageId);
    }
  }, [location.pathname, activePage, setActivePage]);

  // Guard: if user tries to access a page they have no permission for, fall back to dashboard
  function guard(page: React.ReactNode, check: boolean): React.ReactNode {
    return check ? page : <Dashboard />;
  }

  // Admin guard: only allow super_admin
  function adminGuard(page: React.ReactNode, isAdmin: boolean): React.ReactNode {
    return isAdmin ? <AdminGuard>{page}</AdminGuard> : <Dashboard />;
  }

  const pages: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    // "product" is the shared route for any product sidebar item
    product: guard(<ProductModule />, hasProductAccess(activeProductId)),
    customers: guard(<CustomersPage />, can("view_customers")),
    tickets: guard(<SupportTicketsPage />, can("view_tickets")),
    reports: guard(<ReportsPage />, can("view_reports")),
    "user-management": guard(<UserManagementPage />, can("manage_users")),
    billing: guard(<BillingPage />, can("view_billing")),
    "audit-log": guard(<AuditLogPage />, can("view_audit")),
    "platform-settings": guard(<PlatformSettingsPage />, currentUser.role === "super_admin"),
    settings: guard(<SettingsPage />, can("configure_product")),
    "organization-info": guard(<SettingsPage />, can("configure_product")),
    organization: guard(<SettingsPage />, can("configure_product")),
    "organization-members": guard(<MembersPage />, can("manage_users")),
    // Admin pages
    "admin-control": adminGuard(<SuperAdminDashboard />, currentUser.role === "super_admin"),
    "admin-roles": adminGuard(<RoleManagementPage />, currentUser.role === "super_admin"),
    "admin-permissions": adminGuard(
      <PermissionManagementPage />,
      currentUser.role === "super_admin"
    ),
    "admin-sidebar": adminGuard(<SidebarManagementPage />, currentUser.role === "super_admin"),
  };

  return <>{pages[activePage] ?? <Dashboard />}</>;
}

// ── Layout shell ──────────────────────────────────────────────────────────────
export function PlatformLayout() {
  return (
    <PlatformProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        <TopNavBar />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto bg-background">
            <PageRenderer />
          </main>
        </div>
      </div>
    </PlatformProvider>
  );
}
