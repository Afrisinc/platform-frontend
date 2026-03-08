import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingService } from "@/services/billingService";

export function useBillingOverview(wsId: string) {
  return useQuery({ queryKey: ["billing", wsId], queryFn: () => billingService.getOverview(wsId) });
}

export function useInvoices(wsId: string) {
  return useQuery({ queryKey: ["invoices", wsId], queryFn: () => billingService.getInvoices(wsId) });
}

export function useUpdatePaymentMethod(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => billingService.updatePaymentMethod(wsId, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["billing", wsId] }),
  });
}

export function useUpgradePlan(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (plan: string) => billingService.upgradePlan(wsId, plan),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["billing", wsId] }),
  });
}
