import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingService } from "@/services/billingService";

export function useBillingOverview(wsId: string) {
  return useQuery({ queryKey: ["billing-overview", wsId], queryFn: () => billingService.getOverview(wsId), enabled: !!wsId });
}

export function useSubscriptions(wsId: string) {
  return useQuery({ queryKey: ["billing-subscriptions", wsId], queryFn: () => billingService.getSubscriptions(wsId), enabled: !!wsId });
}

export function usePlanOptions(productId: string) {
  return useQuery({ queryKey: ["plan-options", productId], queryFn: () => billingService.getPlanOptions(productId), enabled: !!productId });
}

export function useUsageMetrics(wsId: string, productId?: string) {
  return useQuery({ queryKey: ["billing-usage", wsId, productId], queryFn: () => billingService.getUsage(wsId, productId), enabled: !!wsId });
}

export function useInvoices(wsId: string) {
  return useQuery({ queryKey: ["billing-invoices", wsId], queryFn: () => billingService.getInvoices(wsId), enabled: !!wsId });
}

export function useInvoiceDetail(wsId: string, invoiceId: string) {
  return useQuery({ queryKey: ["billing-invoice", wsId, invoiceId], queryFn: () => billingService.getInvoiceDetail(wsId, invoiceId), enabled: !!wsId && !!invoiceId });
}

export function usePaymentMethods(wsId: string) {
  return useQuery({ queryKey: ["payment-methods", wsId], queryFn: () => billingService.getPaymentMethods(wsId), enabled: !!wsId });
}

export function useBillingSettings(wsId: string) {
  return useQuery({ queryKey: ["billing-settings", wsId], queryFn: () => billingService.getBillingSettings(wsId), enabled: !!wsId });
}

/* Mutations */

export function useChangePlan(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, planId }: { productId: string; planId: string }) => billingService.changePlan(wsId, productId, planId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["billing-subscriptions", wsId] });
      qc.invalidateQueries({ queryKey: ["billing-overview", wsId] });
    },
  });
}

export function useCancelSubscription(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => billingService.cancelSubscription(wsId, productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["billing-subscriptions", wsId] });
      qc.invalidateQueries({ queryKey: ["billing-overview", wsId] });
    },
  });
}

export function useAddPaymentMethod(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { token: string }) => billingService.addPaymentMethod(wsId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payment-methods", wsId] }),
  });
}

export function useRemovePaymentMethod(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pmId: string) => billingService.removePaymentMethod(wsId, pmId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payment-methods", wsId] }),
  });
}

export function useSetDefaultPaymentMethod(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pmId: string) => billingService.setDefaultPaymentMethod(wsId, pmId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payment-methods", wsId] }),
  });
}

export function useUpdateBillingSettings(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof billingService.updateBillingSettings>[1]) => billingService.updateBillingSettings(wsId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["billing-settings", wsId] }),
  });
}
