import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/productService";

export function useProducts(wsId: string) {
  return useQuery({ queryKey: ["products", wsId], queryFn: () => productService.list(wsId) });
}

export function useActivateProduct(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => productService.activate(wsId, productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products", wsId] }),
  });
}

export function useDeactivateProduct(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => productService.deactivate(wsId, productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products", wsId] }),
  });
}
