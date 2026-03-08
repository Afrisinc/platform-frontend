import { TopNavBar } from "./TopNavBar";
import { AppSidebar } from "./AppSidebar";
import { PlatformProvider, usePlatform } from "@/contexts/PlatformContext";
import Dashboard from "@/pages/Dashboard";
import ProductsPage from "@/pages/ProductsPage";
import MembersPage from "@/pages/MembersPage";
import ApiKeysPage from "@/pages/ApiKeysPage";
import BillingPage from "@/pages/BillingPage";
import SettingsPage from "@/pages/SettingsPage";

function PageRenderer() {
  const { activePage } = usePlatform();

  const pages: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    products: <ProductsPage />,
    members: <MembersPage />,
    "api-keys": <ApiKeysPage />,
    billing: <BillingPage />,
    settings: <SettingsPage />,
  };

  return <>{pages[activePage] || <Dashboard />}</>;
}

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
