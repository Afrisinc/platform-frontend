import type { Product } from "@/contexts/PlatformContext";

// GET    /workspaces/:wsId/products
// POST   /workspaces/:wsId/products/:id/activate
// POST   /workspaces/:wsId/products/:id/deactivate

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

const MOCK_PRODUCTS: Product[] = [
  { id: "notify", name: "Notify", description: "Send email, SMS and push notifications.", icon: "Bell", color: "202 97% 45%", url: "https://notify.afrisinc.com/app", active: true },
  { id: "crm", name: "CRM", description: "Manage customer relationships.", icon: "Users", color: "152 60% 42%", url: "https://crm.afrisinc.com/app", active: true },
  { id: "billing", name: "Billing", description: "Manage payments and subscriptions.", icon: "CreditCard", color: "38 92% 50%", url: "https://billing.afrisinc.com/app", active: true },
  { id: "analytics", name: "Analytics", description: "View metrics and reports.", icon: "BarChart3", color: "270 60% 55%", url: "https://analytics.afrisinc.com/app", active: false },
  { id: "vpn", name: "VPN", description: "Secure network access for your team.", icon: "Shield", color: "340 65% 50%", url: "https://vpn.afrisinc.com/app", active: false },
];

export const productService = {
  list: async (_wsId: string): Promise<Product[]> => {
    await delay();
    return MOCK_PRODUCTS;
  },

  activate: async (_wsId: string, productId: string): Promise<Product> => {
    await delay();
    const p = MOCK_PRODUCTS.find((p) => p.id === productId)!;
    return { ...p, active: true };
  },

  deactivate: async (_wsId: string, productId: string): Promise<Product> => {
    await delay();
    const p = MOCK_PRODUCTS.find((p) => p.id === productId)!;
    return { ...p, active: false };
  },
};
