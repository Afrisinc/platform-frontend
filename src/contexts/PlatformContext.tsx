import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Workspace {
  id: string;
  name: string;
  initials: string;
  owner: string;
  createdAt: string;
  plan: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  url: string;
  active: boolean;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Developer" | "Viewer";
  status: "Active" | "Pending";
  joinedAt: string;
  avatar: string;
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  environment: "Production" | "Test";
  createdBy: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  amount: string;
  status: "Paid" | "Pending" | "Failed";
  date: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  detail: string;
  time: string;
}

interface PlatformContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace;
  setCurrentWorkspace: (ws: Workspace) => void;
  products: Product[];
  members: Member[];
  apiKeys: ApiKey[];
  invoices: Invoice[];
  activities: ActivityItem[];
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  activePage: string;
  setActivePage: (page: string) => void;
}

const workspaces: Workspace[] = [
  { id: "1", name: "Afrisinc Ltd", initials: "AL", owner: "John Doe", createdAt: "2024-01-15", plan: "Pro" },
  { id: "2", name: "HomeX Tech", initials: "HX", owner: "John Doe", createdAt: "2024-06-01", plan: "Free" },
  { id: "3", name: "Personal", initials: "PE", owner: "John Doe", createdAt: "2025-01-10", plan: "Free" },
];

const products: Product[] = [
  { id: "notify", name: "Notify", description: "Send email, SMS and push notifications.", icon: "Bell", color: "202 97% 45%", url: "https://notify.afrisinc.com/app", active: true },
  { id: "crm", name: "CRM", description: "Manage customer relationships.", icon: "Users", color: "152 60% 42%", url: "https://crm.afrisinc.com/app", active: true },
  { id: "billing", name: "Billing", description: "Manage payments and subscriptions.", icon: "CreditCard", color: "38 92% 50%", url: "https://billing.afrisinc.com/app", active: true },
  { id: "analytics", name: "Analytics", description: "View metrics and reports.", icon: "BarChart3", color: "270 60% 55%", url: "https://analytics.afrisinc.com/app", active: false },
];

const members: Member[] = [
  { id: "1", name: "John Doe", email: "john@afrisinc.com", role: "Owner", status: "Active", joinedAt: "2024-01-15", avatar: "JD" },
  { id: "2", name: "Sarah Chen", email: "sarah@afrisinc.com", role: "Admin", status: "Active", joinedAt: "2024-02-20", avatar: "SC" },
  { id: "3", name: "Emma Wilson", email: "emma@afrisinc.com", role: "Developer", status: "Active", joinedAt: "2024-03-10", avatar: "EW" },
  { id: "4", name: "Michael Brown", email: "michael@afrisinc.com", role: "Developer", status: "Active", joinedAt: "2024-05-01", avatar: "MB" },
  { id: "5", name: "Lisa Park", email: "lisa@afrisinc.com", role: "Viewer", status: "Pending", joinedAt: "2025-03-01", avatar: "LP" },
];

const apiKeys: ApiKey[] = [
  { id: "1", name: "Production API", prefix: "ak_live_7x9K", environment: "Production", createdBy: "John Doe", createdAt: "2024-06-15" },
  { id: "2", name: "Test Key", prefix: "ak_test_3mP2", environment: "Test", createdBy: "Sarah Chen", createdAt: "2024-08-20" },
  { id: "3", name: "CI/CD Pipeline", prefix: "ak_live_9bQ4", environment: "Production", createdBy: "Emma Wilson", createdAt: "2025-01-05" },
];

const invoices: Invoice[] = [
  { id: "INV-001", amount: "$49.00", status: "Paid", date: "2025-03-01" },
  { id: "INV-002", amount: "$49.00", status: "Paid", date: "2025-02-01" },
  { id: "INV-003", amount: "$49.00", status: "Paid", date: "2025-01-01" },
  { id: "INV-004", amount: "$29.00", status: "Paid", date: "2024-12-01" },
];

const activities: ActivityItem[] = [
  { id: "1", action: "John invited Emma", detail: "emma@afrisinc.com added as Developer", time: "2 min ago" },
  { id: "2", action: "Emma created API key", detail: "CI/CD Pipeline key generated", time: "1 hour ago" },
  { id: "3", action: "Notify product activated", detail: "Notify enabled for workspace", time: "3 hours ago" },
  { id: "4", action: "Sarah updated billing", detail: "Plan upgraded to Pro", time: "1 day ago" },
  { id: "5", action: "CRM sync completed", detail: "2,340 contacts imported", time: "2 days ago" },
];

const PlatformContext = createContext<PlatformContextType | null>(null);

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [currentWorkspace, setCurrentWorkspace] = useState(workspaces[0]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <PlatformContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        setCurrentWorkspace,
        products,
        members,
        apiKeys,
        invoices,
        activities,
        sidebarCollapsed,
        setSidebarCollapsed,
        activePage,
        setActivePage,
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
