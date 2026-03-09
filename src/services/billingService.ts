/**
 * Billing Service — mock API layer
 *
 * Endpoints modelled:
 *   GET  /billing/overview
 *   GET  /billing/subscriptions
 *   GET  /billing/usage
 *   GET  /billing/invoices
 *   GET  /billing/invoices/:id
 *   GET  /billing/payment-methods
 *   GET  /billing/settings
 *   POST /billing/payment-method
 *   POST /billing/payment-method/:id/default
 *   DELETE /billing/payment-method/:id
 *   POST /billing/subscriptions/:productId/change-plan
 *   POST /billing/subscriptions/:productId/cancel
 *   PUT  /billing/settings
 */

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

/* ─── Types ──────────────────────────────────────────────────── */

export type BillingModel = "subscription" | "usage" | "seat";

export interface ProductSubscription {
  productId: string;
  productName: string;
  plan: string;
  billingModel: BillingModel;
  billingCycle: "monthly" | "annual";
  price: number;          // base price
  seats?: number;         // for seat-based
  pricePerSeat?: number;
  status: "active" | "trialing" | "canceled" | "past_due";
  nextBillingDate: string;
  color: string;          // HSL for badges
}

export interface UsageMetric {
  productId: string;
  productName: string;
  metric: string;
  unit: string;
  currentValue: number;
  limit: number | null;
  rateDescription: string;
  currentCharges: number;
  color: string;
  dailyUsage: { date: string; value: number }[];
}

export interface BillingOverview {
  estimatedTotal: number;
  subscriptionCharges: number;
  usageCharges: number;
  nextInvoiceDate: string;
  subscriptions: ProductSubscription[];
  usageSummary: { productName: string; charges: number }[];
  alerts: { id: string; type: "info" | "warning" | "error"; message: string }[];
  paymentMethod: PaymentMethod | null;
}

export interface InvoiceLineItem {
  product: string;
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  products: string[];
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "paid" | "pending" | "failed" | "void";
  pdfUrl: string;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "bank" | "mobile_money";
  brand: string;
  last4: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
  addedAt: string;
}

export interface BillingSettings {
  billingEmail: string;
  companyName: string;
  taxId: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  autoPay: boolean;
  currency: string;
}

export interface PlanOption {
  id: string;
  name: string;
  price: number;
  features: string[];
}

/* ─── Seed Data ──────────────────────────────────────────────── */

const SUBSCRIPTIONS: ProductSubscription[] = [
  {
    productId: "notify",
    productName: "Notify",
    plan: "Pro",
    billingModel: "subscription",
    billingCycle: "monthly",
    price: 29,
    status: "active",
    nextBillingDate: "2026-06-01",
    color: "202 97% 45%",
  },
  {
    productId: "vpn",
    productName: "Afrisinc VPN",
    plan: "Team",
    billingModel: "seat",
    billingCycle: "monthly",
    price: 15,
    seats: 3,
    pricePerSeat: 5,
    status: "active",
    nextBillingDate: "2026-06-01",
    color: "270 60% 55%",
  },
  {
    productId: "pay",
    productName: "Afrisinc Pay",
    plan: "Standard",
    billingModel: "usage",
    billingCycle: "monthly",
    price: 0,
    status: "active",
    nextBillingDate: "2026-06-01",
    color: "38 92% 50%",
  },
];

const USAGE_METRICS: UsageMetric[] = [
  {
    productId: "pay",
    productName: "Afrisinc Pay",
    metric: "Transactions",
    unit: "transactions",
    currentValue: 523,
    limit: null,
    rateDescription: "2.9% + $0.30 per transaction",
    currentCharges: 42.3,
    color: "38 92% 50%",
    dailyUsage: Array.from({ length: 30 }, (_, i) => ({
      date: `2026-05-${String(i + 1).padStart(2, "0")}`,
      value: Math.floor(Math.random() * 30) + 5,
    })),
  },
  {
    productId: "notify",
    productName: "Notify",
    metric: "Messages Sent",
    unit: "messages",
    currentValue: 12_480,
    limit: 50_000,
    rateDescription: "Included in Pro plan (50k/mo)",
    currentCharges: 0,
    color: "202 97% 45%",
    dailyUsage: Array.from({ length: 30 }, (_, i) => ({
      date: `2026-05-${String(i + 1).padStart(2, "0")}`,
      value: Math.floor(Math.random() * 800) + 200,
    })),
  },
];

const INVOICES: Invoice[] = [
  {
    id: "inv_1",
    number: "A-1023",
    date: "2026-05-01",
    dueDate: "2026-05-15",
    products: ["Notify", "Afrisinc Pay"],
    lineItems: [
      { product: "Notify", description: "Pro Plan – May 2026", amount: 29 },
      { product: "Afrisinc Pay", description: "523 transactions", amount: 42.3 },
      { product: "Afrisinc VPN", description: "Team (3 seats)", amount: 15 },
    ],
    subtotal: 86.3,
    tax: 0,
    total: 86.3,
    status: "paid",
    pdfUrl: "#",
  },
  {
    id: "inv_2",
    number: "A-1022",
    date: "2026-04-01",
    dueDate: "2026-04-15",
    products: ["Notify", "Afrisinc Pay"],
    lineItems: [
      { product: "Notify", description: "Pro Plan – Apr 2026", amount: 29 },
      { product: "Afrisinc Pay", description: "489 transactions", amount: 38.7 },
      { product: "Afrisinc VPN", description: "Team (3 seats)", amount: 15 },
    ],
    subtotal: 82.7,
    tax: 0,
    total: 82.7,
    status: "paid",
    pdfUrl: "#",
  },
  {
    id: "inv_3",
    number: "A-1021",
    date: "2026-03-01",
    dueDate: "2026-03-15",
    products: ["Notify"],
    lineItems: [
      { product: "Notify", description: "Pro Plan – Mar 2026", amount: 29 },
      { product: "Afrisinc Pay", description: "412 transactions", amount: 34.2 },
    ],
    subtotal: 63.2,
    tax: 0,
    total: 63.2,
    status: "paid",
    pdfUrl: "#",
  },
  {
    id: "inv_4",
    number: "A-1020",
    date: "2026-02-01",
    dueDate: "2026-02-15",
    products: ["Notify"],
    lineItems: [
      { product: "Notify", description: "Pro Plan – Feb 2026", amount: 29 },
    ],
    subtotal: 29,
    tax: 0,
    total: 29,
    status: "paid",
    pdfUrl: "#",
  },
];

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "pm_1", type: "card", brand: "Visa", last4: "4242", expMonth: 5, expYear: 2028, isDefault: true, addedAt: "2026-05-10" },
  { id: "pm_2", type: "card", brand: "Mastercard", last4: "8888", expMonth: 11, expYear: 2027, isDefault: false, addedAt: "2026-03-22" },
];

const BILLING_SETTINGS: BillingSettings = {
  billingEmail: "finance@afrisinc.com",
  companyName: "Afrisinc Ltd",
  taxId: "RW-123456789",
  address: {
    line1: "KG 123 St",
    line2: "Kigali Heights, 4th Floor",
    city: "Kigali",
    state: "Kigali City",
    postalCode: "00100",
    country: "Rwanda",
  },
  autoPay: true,
  currency: "USD",
};

const PLAN_OPTIONS: Record<string, PlanOption[]> = {
  notify: [
    { id: "free", name: "Free", price: 0, features: ["1,000 messages/mo", "Email only", "Community support"] },
    { id: "pro", name: "Pro", price: 29, features: ["50,000 messages/mo", "Email + SMS + Push", "Priority support", "Templates"] },
    { id: "enterprise", name: "Enterprise", price: 99, features: ["Unlimited messages", "All channels", "Dedicated support", "SLA", "SSO"] },
  ],
  vpn: [
    { id: "personal", name: "Personal", price: 5, features: ["1 device", "All locations", "Basic support"] },
    { id: "team", name: "Team", price: 5, features: ["Per seat", "5+ devices", "Admin console", "Priority support"] },
    { id: "business", name: "Business", price: 8, features: ["Per seat", "Unlimited devices", "SSO", "Dedicated IP", "SLA"] },
  ],
  pay: [
    { id: "standard", name: "Standard", price: 0, features: ["2.9% + $0.30/txn", "Dashboard", "Basic reports"] },
    { id: "plus", name: "Plus", price: 25, features: ["2.4% + $0.25/txn", "Advanced reports", "Webhooks", "Priority support"] },
  ],
};

/* ─── Service ────────────────────────────────────────────────── */

export const billingService = {
  /* Overview */
  getOverview: async (_wsId: string): Promise<BillingOverview> => {
    await delay();
    const subCharges = SUBSCRIPTIONS.reduce((s, p) => s + p.price, 0);
    const usageCharges = USAGE_METRICS.reduce((s, u) => s + u.currentCharges, 0);
    return {
      estimatedTotal: subCharges + usageCharges,
      subscriptionCharges: subCharges,
      usageCharges,
      nextInvoiceDate: "2026-06-01",
      subscriptions: SUBSCRIPTIONS,
      usageSummary: USAGE_METRICS.map((u) => ({ productName: u.productName, charges: u.currentCharges })),
      alerts: [
        { id: "a1", type: "info", message: "Your next invoice is estimated at $86.30 on Jun 1, 2026." },
      ],
      paymentMethod: PAYMENT_METHODS.find((p) => p.isDefault) ?? null,
    };
  },

  /* Subscriptions */
  getSubscriptions: async (_wsId: string): Promise<ProductSubscription[]> => {
    await delay();
    return SUBSCRIPTIONS;
  },

  getPlanOptions: async (productId: string): Promise<PlanOption[]> => {
    await delay();
    return PLAN_OPTIONS[productId] ?? [];
  },

  changePlan: async (_wsId: string, _productId: string, _planId: string): Promise<void> => {
    await delay(400);
  },

  cancelSubscription: async (_wsId: string, _productId: string): Promise<void> => {
    await delay(400);
  },

  /* Usage */
  getUsage: async (_wsId: string, _productId?: string): Promise<UsageMetric[]> => {
    await delay();
    return _productId ? USAGE_METRICS.filter((u) => u.productId === _productId) : USAGE_METRICS;
  },

  /* Invoices */
  getInvoices: async (_wsId: string): Promise<Invoice[]> => {
    await delay();
    return INVOICES;
  },

  getInvoiceDetail: async (_wsId: string, invoiceId: string): Promise<Invoice | undefined> => {
    await delay();
    return INVOICES.find((i) => i.id === invoiceId);
  },

  /* Payment Methods */
  getPaymentMethods: async (_wsId: string): Promise<PaymentMethod[]> => {
    await delay();
    return PAYMENT_METHODS;
  },

  addPaymentMethod: async (_wsId: string, _data: { token: string }): Promise<PaymentMethod> => {
    await delay(500);
    return { id: "pm_new", type: "card", brand: "Visa", last4: "1234", expMonth: 12, expYear: 2029, isDefault: false, addedAt: new Date().toISOString() };
  },

  removePaymentMethod: async (_wsId: string, _pmId: string): Promise<void> => {
    await delay(400);
  },

  setDefaultPaymentMethod: async (_wsId: string, _pmId: string): Promise<void> => {
    await delay(400);
  },

  /* Kept for backward compat */
  updatePaymentMethod: async (_wsId: string, _token: string): Promise<void> => {
    await delay();
  },

  upgradePlan: async (_wsId: string, _plan: string): Promise<void> => {
    await delay();
  },

  /* Settings */
  getBillingSettings: async (_wsId: string): Promise<BillingSettings> => {
    await delay();
    return BILLING_SETTINGS;
  },

  updateBillingSettings: async (_wsId: string, _data: Partial<BillingSettings>): Promise<BillingSettings> => {
    await delay(400);
    return { ...BILLING_SETTINGS, ..._data };
  },
};
