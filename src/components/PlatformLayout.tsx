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
import RoleManagementPage from "@/pages/admin/RoleManagementPage";
import PermissionManagementPage from "@/pages/admin/PermissionManagementPage";
import SidebarManagementPage from "@/pages/admin/SidebarManagementPage";

// ── Page routing (no URL changes — client-side active-page state) ─────────────
function PageRenderer() {
  const { activePage, activeProductId, currentUser, can, hasProductAccess } = usePlatform();

  // Guard: if user tries to access a page they have no permission for, fall back to dashboard
  function guard(page: React.ReactNode, check: boolean): React.ReactNode {
    return check ? page : <Dashboard />;
  }

  // Admin guard: only allow super_admin
  function adminGuard(page: React.ReactNode, isAdmin: boolean): React.ReactNode {
    return isAdmin ? <AdminGuard>{page}</AdminGuard> : <Dashboard />;
  }

  const pages: Record<string, React.ReactNode> = {
    dashboard:           <Dashboard />,
    // "product" is the shared route for any product sidebar item
    product:             guard(<ProductModule />,          hasProductAccess(activeProductId)),
    customers:           guard(<CustomersPage />,          can("view_customers")),
    tickets:             guard(<SupportTicketsPage />,     can("view_tickets")),
    reports:             guard(<ReportsPage />,            can("view_reports")),
    "user-management":   guard(<UserManagementPage />,     can("manage_users")),
    billing:             guard(<BillingPage />,            can("view_billing")),
    "audit-log":         guard(<AuditLogPage />,           can("view_audit")),
    "platform-settings": guard(<PlatformSettingsPage />,   currentUser.role === "super_admin"),
    settings:            guard(<SettingsPage />,           can("configure_product")),
    // Admin pages
    "admin-roles":       adminGuard(<RoleManagementPage />, currentUser.role === "super_admin"),
    "admin-permissions": adminGuard(<PermissionManagementPage />, currentUser.role === "super_admin"),
    "admin-sidebar":     adminGuard(<SidebarManagementPage />, currentUser.role === "super_admin"),
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
