import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";

/**
 * Hook to fetch products enrolled by the current user.
 * Uses GET /products/me endpoint.
 */
export function useUserProducts() {
  return useQuery({
    queryKey: ["user-products"],
    queryFn: () => productService.getUserProducts(),
  });
}
