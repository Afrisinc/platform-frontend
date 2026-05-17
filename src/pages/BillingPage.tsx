import { useState } from "react";
import { LayoutDashboard, Package, BarChart3, Receipt, CreditCard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import BillingOverviewTab from "./billing/BillingOverviewTab";
import SubscriptionsTab from "./billing/SubscriptionsTab";
import UsageTab from "./billing/UsageTab";
import InvoicesTab from "./billing/InvoicesTab";
import PaymentMethodsTab from "./billing/PaymentMethodsTab";
import BillingSettingsTab from "./billing/BillingSettingsTab";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "subscriptions", label: "Subscriptions", icon: Package },
  { id: "usage", label: "Usage", icon: BarChart3 },
  { id: "invoices", label: "Invoices", icon: Receipt },
  { id: "payment-methods", label: "Payment Methods", icon: CreditCard },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

type TabId = (typeof tabs)[number]["id"];

const tabContent: Record<TabId, React.ReactNode> = {
  overview: <BillingOverviewTab />,
  subscriptions: <SubscriptionsTab />,
  usage: <UsageTab />,
  invoices: <InvoicesTab />,
  "payment-methods": <PaymentMethodsTab />,
  settings: <BillingSettingsTab />,
};

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground mt-1">
          Manage workspace billing, subscriptions, and payment methods.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto border-b border-border pb-px -mb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap border-b-2",
              activeTab === tab.id
                ? "border-primary text-primary bg-accent/40"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>{tabContent[activeTab]}</div>
    </div>
  );
}
