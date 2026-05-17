import type { Workspace } from "@/contexts/PlatformContext";

// Endpoint definitions — mocked data returned inline
// POST   /workspaces
// GET    /workspaces
// GET    /workspaces/:id
// PATCH  /workspaces/:id
// DELETE /workspaces/:id

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

const MOCK_WORKSPACES: Workspace[] = [
  {
    id: "1",
    name: "Afrisinc Ltd",
    initials: "AL",
    owner: "John Doe",
    createdAt: "2024-01-15",
    plan: "Pro",
  },
  {
    id: "2",
    name: "HomeX Tech",
    initials: "HX",
    owner: "John Doe",
    createdAt: "2024-06-01",
    plan: "Free",
  },
  {
    id: "3",
    name: "Personal",
    initials: "PE",
    owner: "John Doe",
    createdAt: "2025-01-10",
    plan: "Free",
  },
];

export const workspaceService = {
  list: async (): Promise<Workspace[]> => {
    await delay();
    return MOCK_WORKSPACES;
  },

  getById: async (id: string): Promise<Workspace> => {
    await delay();
    return MOCK_WORKSPACES.find((w) => w.id === id) ?? MOCK_WORKSPACES[0];
  },

  create: async (data: { name: string }): Promise<Workspace> => {
    await delay();
    return {
      id: crypto.randomUUID(),
      name: data.name,
      initials: data.name.slice(0, 2).toUpperCase(),
      owner: "John Doe",
      createdAt: new Date().toISOString(),
      plan: "Free",
    };
  },

  update: async (id: string, data: Partial<Workspace>): Promise<Workspace> => {
    await delay();
    const ws = MOCK_WORKSPACES.find((w) => w.id === id) ?? MOCK_WORKSPACES[0];
    return { ...ws, ...data };
  },

  delete: async (id: string): Promise<void> => {
    await delay();
  },
};
