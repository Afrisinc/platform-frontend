import type { Invoice } from "@/contexts/PlatformContext";

// GET    /workspaces/:wsId/billing
// GET    /workspaces/:wsId/billing/invoices
// POST   /workspaces/:wsId/billing/payment-method
// POST   /workspaces/:wsId/billing/upgrade

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

export interface ProductSubscription {
  productId: string;
  productName: string;
  plan: string;
  price: number;
  status: "active" | "trialing" | "canceled";
  nextBillingDate: string;
}

export interface BillingOverview {
  plan: string;
  totalMonthly: number;
  subscriptions: ProductSubscription[];
  paymentMethod: { brand: string; last4: string; expMonth: number; expYear: number } | null;
}

const MOCK_SUBSCRIPTIONS: ProductSubscription[] = [
  { productId: "notify", productName: "Notify", plan: "Pro", price: 19, status: "active", nextBillingDate: "2025-04-01" },
  { productId: "crm", productName: "CRM", plan: "Starter", price: 15, status: "active", nextBillingDate: "2025-04-01" },
  { productId: "billing", productName: "Billing", plan: "Pro", price: 15, status: "active", nextBillingDate: "2025-04-01" },
];

const MOCK_OVERVIEW: BillingOverview = {
  plan: "Pro",
  totalMonthly: 49,
  subscriptions: MOCK_SUBSCRIPTIONS,
  paymentMethod: { brand: "Visa", last4: "4242", expMonth: 12, expYear: 2026 },
};

const MOCK_INVOICES: Invoice[] = [
  { id: "INV-001", amount: "$49.00", status: "Paid", date: "2025-03-01" },
  { id: "INV-002", amount: "$49.00", status: "Paid", date: "2025-02-01" },
  { id: "INV-003", amount: "$49.00", status: "Paid", date: "2025-01-01" },
  { id: "INV-004", amount: "$29.00", status: "Paid", date: "2024-12-01" },
];

export const billingService = {
  getOverview: async (_wsId: string): Promise<BillingOverview> => {
    await delay();
    return MOCK_OVERVIEW;
  },

  getInvoices: async (_wsId: string): Promise<Invoice[]> => {
    await delay();
    return MOCK_INVOICES;
  },

  updatePaymentMethod: async (_wsId: string, _token: string): Promise<void> => {
    await delay();
  },

  upgradePlan: async (_wsId: string, _plan: string): Promise<void> => {
    await delay();
  },
};
