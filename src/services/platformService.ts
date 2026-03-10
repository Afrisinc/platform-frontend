// Platform resolver service — mocked
// GET /platform/resolve
// GET /workspaces/:id/products

import type { Workspace, Product } from "@/contexts/PlatformContext";

const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

export interface WorkspaceWithProducts extends Workspace {
  products: Product[];
}

const MOCK_WORKSPACES: WorkspaceWithProducts[] = [
  {
    id: "ws_1",
    name: "Afrisinc Ltd",
    initials: "AL",
    owner: "John Doe",
    createdAt: "2024-01-15",
    plan: "Pro",
    products: [
      { id: "notify", name: "Notify", description: "Email, SMS & push notifications", icon: "Bell", color: "202 97% 45%", url: "/workspace/ws_1/notify", active: true },
      { id: "pay", name: "Pay", description: "Payments infrastructure for Africa", icon: "CreditCard", color: "152 60% 42%", url: "/workspace/ws_1/pay", active: true },
      { id: "vpn", name: "VPN", description: "Secure network access for teams", icon: "Shield", color: "270 60% 55%", url: "/workspace/ws_1/vpn", active: true },
    ],
  },
  {
    id: "ws_2",
    name: "Startup Team",
    initials: "ST",
    owner: "John Doe",
    createdAt: "2024-06-01",
    plan: "Free",
    products: [
      { id: "notify", name: "Notify", description: "Email, SMS & push notifications", icon: "Bell", color: "202 97% 45%", url: "/workspace/ws_2/notify", active: true },
    ],
  },
  {
    id: "ws_3",
    name: "Agency Workspace",
    initials: "AW",
    owner: "John Doe",
    createdAt: "2025-01-10",
    plan: "Pro",
    products: [
      { id: "notify", name: "Notify", description: "Email, SMS & push notifications", icon: "Bell", color: "202 97% 45%", url: "/workspace/ws_3/notify", active: true },
      { id: "pay", name: "Pay", description: "Payments infrastructure for Africa", icon: "CreditCard", color: "152 60% 42%", url: "/workspace/ws_3/pay", active: true },
      { id: "forms", name: "Forms", description: "Drag-and-drop form builder", icon: "FileText", color: "38 92% 50%", url: "/workspace/ws_3/forms", active: true },
      { id: "identity", name: "Identity", description: "Auth & identity management", icon: "Fingerprint", color: "340 65% 50%", url: "/workspace/ws_3/identity", active: true },
    ],
  },
];

const ALL_PRODUCTS: Product[] = [
  { id: "notify", name: "Notify", description: "Email, SMS & push notifications", icon: "Bell", color: "202 97% 45%", url: "", active: false },
  { id: "pay", name: "Pay", description: "Payments infrastructure for Africa", icon: "CreditCard", color: "152 60% 42%", url: "", active: false },
  { id: "vpn", name: "VPN", description: "Secure network access for teams", icon: "Shield", color: "270 60% 55%", url: "", active: false },
  { id: "forms", name: "Forms", description: "Drag-and-drop form builder", icon: "FileText", color: "38 92% 50%", url: "", active: false },
  { id: "identity", name: "Identity", description: "Auth & identity management", icon: "Fingerprint", color: "340 65% 50%", url: "", active: false },
];

export const platformService = {
  getUserWorkspaces: async (): Promise<WorkspaceWithProducts[]> => {
    await delay(1200);
    return MOCK_WORKSPACES;
  },

  getWorkspaceProducts: async (workspaceId: string): Promise<Product[]> => {
    await delay(800);
    const ws = MOCK_WORKSPACES.find((w) => w.id === workspaceId);
    return ws?.products ?? [];
  },

  getAllProducts: async (): Promise<Product[]> => {
    await delay(400);
    return ALL_PRODUCTS;
  },

  validateWorkspaceAccess: async (workspaceId: string): Promise<boolean> => {
    await delay(300);
    return MOCK_WORKSPACES.some((w) => w.id === workspaceId);
  },

  validateProductAccess: async (workspaceId: string, productId: string): Promise<boolean> => {
    await delay(300);
    const ws = MOCK_WORKSPACES.find((w) => w.id === workspaceId);
    return ws?.products.some((p) => p.id === productId) ?? false;
  },

  createWorkspace: async (data: { name: string }): Promise<WorkspaceWithProducts> => {
    await delay(1000);
    return {
      id: `ws_${crypto.randomUUID().slice(0, 8)}`,
      name: data.name,
      initials: data.name.slice(0, 2).toUpperCase(),
      owner: "John Doe",
      createdAt: new Date().toISOString(),
      plan: "Free",
      products: [],
    };
  },
};
