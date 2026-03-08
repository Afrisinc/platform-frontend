import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiKeyService } from "@/services/apiKeyService";
import type { ApiKey } from "@/contexts/PlatformContext";

export function useApiKeys(wsId: string) {
  return useQuery({ queryKey: ["apiKeys", wsId], queryFn: () => apiKeyService.list(wsId) });
}

export function useCreateApiKey(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; environment: ApiKey["environment"]; description?: string }) => apiKeyService.create(wsId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["apiKeys", wsId] }),
  });
}

export function useRevokeApiKey(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (keyId: string) => apiKeyService.revoke(wsId, keyId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["apiKeys", wsId] }),
  });
}
