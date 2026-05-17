/**
 * useAdminProducts Hook
 * State management for platform-level product administration.
 */

import { useState, useCallback } from "react";
import type {
  AdminProduct,
  ProductEnrollmentStat,
  ProductAccount,
  CreateProductPayload,
  UpdateProductPayload,
} from "@/types/admin";
import {
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  fetchAdminProductEnrollments,
  fetchAdminProductAccounts,
} from "@/lib/platformAdminApi";

interface ProductsState {
  products: AdminProduct[];
  enrollments: ProductEnrollmentStat[];
  loading: boolean;
  error: string | null;
}

export function useAdminProducts(token: string) {
  const [state, setState] = useState<ProductsState>({
    products: [],
    enrollments: [],
    loading: false,
    error: null,
  });

  const loadProducts = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [productsRes, enrollmentsRes] = await Promise.all([
        fetchAdminProducts(token),
        fetchAdminProductEnrollments(token),
      ]);
      setState((s) => ({
        ...s,
        products: productsRes?.data ?? [],
        enrollments: enrollmentsRes?.data ?? [],
        loading: false,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load products",
      }));
    }
  }, [token]);

  const createProduct = useCallback(
    async (payload: CreateProductPayload): Promise<AdminProduct> => {
      const res = await createAdminProduct(token, payload);
      const product = res?.data;
      setState((s) => ({ ...s, products: [product, ...s.products] }));
      return product;
    },
    [token]
  );

  const updateProduct = useCallback(
    async (productId: string, payload: UpdateProductPayload): Promise<AdminProduct> => {
      const res = await updateAdminProduct(token, productId, payload);
      const updated = res?.data;
      setState((s) => ({
        ...s,
        products: s.products.map((p) => (p.id === productId ? updated : p)),
      }));
      return updated;
    },
    [token]
  );

  return {
    products: state.products,
    enrollments: state.enrollments,
    loading: state.loading,
    error: state.error,
    loadProducts,
    createProduct,
    updateProduct,
  };
}

// ── Product Accounts (lazy, per-product) ──────────────────────────────────────

interface ProductAccountsState {
  accounts: ProductAccount[];
  total: number;
  loading: boolean;
  error: string | null;
}

export function useProductAccounts(token: string, productId: string) {
  const [state, setState] = useState<ProductAccountsState>({
    accounts: [],
    total: 0,
    loading: false,
    error: null,
  });

  const loadAccounts = useCallback(
    async (page = 1, limit = 50, status?: string) => {
      if (!productId) return;
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const res = await fetchAdminProductAccounts(token, productId, page, limit, status);
        const d = res?.data ?? {};
        setState((s) => ({
          ...s,
          accounts: d.accounts ?? [],
          total: d.pagination?.total ?? 0,
          loading: false,
        }));
      } catch (err) {
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load product accounts",
        }));
      }
    },
    [token, productId]
  );

  return {
    accounts: state.accounts,
    total: state.total,
    loading: state.loading,
    error: state.error,
    loadAccounts,
  };
}
