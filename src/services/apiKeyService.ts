import type { ApiKey } from "@/contexts/PlatformContext";

// GET    /workspaces/:wsId/api-keys
// POST   /workspaces/:wsId/api-keys
// DELETE /workspaces/:wsId/api-keys/:id

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

const MOCK_KEYS: ApiKey[] = [
  {
    id: "1",
    name: "Production API",
    prefix: "ak_live_7x9K",
    environment: "Production",
    createdBy: "John Doe",
    createdAt: "2024-06-15",
  },
  {
    id: "2",
    name: "Test Key",
    prefix: "ak_test_3mP2",
    environment: "Test",
    createdBy: "Sarah Chen",
    createdAt: "2024-08-20",
  },
  {
    id: "3",
    name: "CI/CD Pipeline",
    prefix: "ak_live_9bQ4",
    environment: "Production",
    createdBy: "Emma Wilson",
    createdAt: "2025-01-05",
  },
];

export interface CreateApiKeyResponse {
  key: ApiKey;
  secret: string; // shown only once
}

export const apiKeyService = {
  list: async (_wsId: string): Promise<ApiKey[]> => {
    await delay();
    return MOCK_KEYS;
  },

  create: async (
    _wsId: string,
    data: { name: string; environment: ApiKey["environment"]; description?: string }
  ): Promise<CreateApiKeyResponse> => {
    await delay();
    const prefix = data.environment === "Production" ? "ak_live_" : "ak_test_";
    const suffix = Math.random().toString(36).slice(2, 6);
    return {
      key: {
        id: crypto.randomUUID(),
        name: data.name,
        prefix: prefix + suffix,
        environment: data.environment,
        createdBy: "John Doe",
        createdAt: new Date().toISOString(),
      },
      secret: prefix + "xK9m2Pq7wR4nT6yB8zA3cD5eF1gH0jL",
    };
  },

  revoke: async (_wsId: string, _keyId: string): Promise<void> => {
    await delay();
  },
};
