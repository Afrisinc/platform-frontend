import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Workspace {
  id: string;
  name: string;
  initials: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  url: string;
}

interface PlatformContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace;
  setCurrentWorkspace: (ws: Workspace) => void;
  products: Product[];
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
}

const workspaces: Workspace[] = [
  { id: "1", name: "Afrisinc Ltd", initials: "AL" },
  { id: "2", name: "HomeX Tech", initials: "HX" },
  { id: "3", name: "Personal", initials: "PE" },
];

const products: Product[] = [
  { id: "notify", name: "Notify", description: "Send email, SMS and push notifications.", icon: "Bell", color: "202 97% 45%", url: "https://notify.afrisinc.com/app" },
  { id: "crm", name: "CRM", description: "Manage customer relationships.", icon: "Users", color: "152 60% 42%", url: "https://crm.afrisinc.com/app" },
  { id: "billing", name: "Billing", description: "Manage subscriptions and payments.", icon: "CreditCard", color: "38 92% 50%", url: "https://billing.afrisinc.com/app" },
  { id: "analytics", name: "Analytics", description: "View metrics and reports.", icon: "BarChart3", color: "270 60% 55%", url: "https://analytics.afrisinc.com/app" },
];

const PlatformContext = createContext<PlatformContextType | null>(null);

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [currentWorkspace, setCurrentWorkspace] = useState(workspaces[0]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <PlatformContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        setCurrentWorkspace,
        products,
        sidebarCollapsed,
        setSidebarCollapsed,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error("usePlatform must be used within PlatformProvider");
  return ctx;
}
