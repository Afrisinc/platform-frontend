/**
 * useNotifyAdmin Hooks
 * State management for Notify plans, accounts, and limit overrides.
 */

import { useState, useCallback } from "react";
import type {
  NotifyPlan,
  NotifyAccount,
  AccountLimitsResponse,
  SetLimitOverridePayload,
} from "@/types/notifyAdmin";
import {
  fetchNotifyPlans,
  fetchNotifyAccounts,
  fetchAccountLimitOverrides,
  setAccountLimitOverride,
  removeAccountLimitOverride,
} from "@/services/notifyAdminService";

// ── Plans hook ───────────────────────────────────────────────────────────────

interface PlansState {
  plans: NotifyPlan[];
  loading: boolean;
  error: string | null;
}

export function useNotifyPlans(token: string) {
  const [state, setState] = useState<PlansState>({ plans: [], loading: false, error: null });

  const loadPlans = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const plans = await fetchNotifyPlans(token);
      setState({ plans, loading: false, error: null });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load plans",
      }));
    }
  }, [token]);

  return {
    plans: state.plans,
    loading: state.loading,
    error: state.error,
    loadPlans,
  };
}

// ── Accounts hook ────────────────────────────────────────────────────────────

interface AccountsState {
  accounts: NotifyAccount[];
  loading: boolean;
  error: string | null;
}

export function useNotifyAccounts(token: string) {
  const [state, setState] = useState<AccountsState>({ accounts: [], loading: false, error: null });

  const loadAccounts = useCallback(
    async (page = 1, limit = 50, search?: string) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const accounts = await fetchNotifyAccounts(token, page, limit, search);
        setState({ accounts, loading: false, error: null });
      } catch (err) {
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load accounts",
        }));
      }
    },
    [token]
  );

  return {
    accounts: state.accounts,
    loading: state.loading,
    error: state.error,
    loadAccounts,
  };
}

// ── Account limit overrides hook ─────────────────────────────────────────────

interface OverridesState {
  data: AccountLimitsResponse | null;
  loading: boolean;
  saving: boolean;
  removing: boolean;
  error: string | null;
}

export function useAccountLimits(token: string, accountId: string) {
  const [state, setState] = useState<OverridesState>({
    data: null,
    loading: false,
    saving: false,
    removing: false,
    error: null,
  });

  const loadLimits = useCallback(async () => {
    if (!accountId) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetchAccountLimitOverrides(token, accountId);
      setState((s) => ({ ...s, data, loading: false }));
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load limits",
      }));
    }
  }, [token, accountId]);

  const setOverride = useCallback(
    async (payload: SetLimitOverridePayload) => {
      setState((s) => ({ ...s, saving: true, error: null }));
      try {
        const override = await setAccountLimitOverride(token, accountId, payload);
        setState((s) => {
          if (!s.data) return { ...s, saving: false };
          const existing = s.data.overrides.findIndex((o) => o.metric === override.metric);
          const overrides =
            existing >= 0
              ? s.data.overrides.map((o, i) => (i === existing ? override : o))
              : [...s.data.overrides, override];
          return { ...s, saving: false, data: { ...s.data, overrides } };
        });
        return override;
      } catch (err) {
        setState((s) => ({
          ...s,
          saving: false,
          error: err instanceof Error ? err.message : "Failed to save override",
        }));
        throw err;
      }
    },
    [token, accountId]
  );

  const removeOverride = useCallback(
    async (metric: string) => {
      setState((s) => ({ ...s, removing: true, error: null }));
      try {
        await removeAccountLimitOverride(token, accountId, metric);
        setState((s) => ({
          ...s,
          removing: false,
          data: s.data
            ? { ...s.data, overrides: s.data.overrides.filter((o) => o.metric !== metric) }
            : s.data,
        }));
      } catch (err) {
        setState((s) => ({
          ...s,
          removing: false,
          error: err instanceof Error ? err.message : "Failed to remove override",
        }));
        throw err;
      }
    },
    [token, accountId]
  );

  return {
    limits: state.data,
    loading: state.loading,
    saving: state.saving,
    removing: state.removing,
    error: state.error,
    loadLimits,
    setOverride,
    removeOverride,
  };
}
