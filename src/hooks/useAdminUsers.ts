/**
 * useAdminUsers Hook
 * State management for platform-level user administration.
 */

import { useState, useCallback } from "react";
import type { AdminUser } from "@/types/admin";
import {
  fetchAdminUsers,
  updateAdminUserStatus,
  fetchAdminOrganizations,
  fetchOrgMembers,
  addOrgMember,
  removeOrgMember,
} from "@/lib/platformAdminApi";

// ── Platform Users ────────────────────────────────────────────────────────────

interface UsersState {
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

export function useAdminUsers(token: string) {
  const [state, setState] = useState<UsersState>({
    users: [],
    total: 0,
    page: 1,
    totalPages: 0,
    loading: false,
    error: null,
  });

  const loadUsers = useCallback(
    async (page = 1, limit = 50, search?: string, status?: string) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const res = await fetchAdminUsers(token, page, limit, search, status);
        const d = res?.data ?? { users: [], total: 0, page: 1, pages: 0 };
        setState((s) => ({
          ...s,
          users: d.users ?? [],
          total: d.total ?? 0,
          page: d.page ?? 1,
          totalPages: d.pages ?? 0,
          loading: false,
        }));
      } catch (err) {
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load users",
        }));
      }
    },
    [token]
  );

  const setUserStatus = useCallback(
    async (userId: string, status: string) => {
      try {
        await updateAdminUserStatus(token, userId, status);
        setState((s) => ({
          ...s,
          users: s.users.map((u) =>
            u.id === userId ? { ...u, status: status as AdminUser["status"] } : u
          ),
        }));
      } catch (err) {
        throw err;
      }
    },
    [token]
  );

  return {
    users: state.users,
    total: state.total,
    page: state.page,
    totalPages: state.totalPages,
    loading: state.loading,
    error: state.error,
    loadUsers,
    setUserStatus,
  };
}

// ── Organization Members ──────────────────────────────────────────────────────

interface OrgState {
  orgs: any[];
  members: any[];
  loading: boolean;
  error: string | null;
}

export function useOrgMembers(token: string) {
  const [state, setState] = useState<OrgState>({
    orgs: [],
    members: [],
    loading: false,
    error: null,
  });

  const loadOrgs = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetchAdminOrganizations(token);
      setState((s) => ({ ...s, orgs: res?.data ?? [], loading: false }));
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load organizations",
      }));
    }
  }, [token]);

  const loadMembers = useCallback(
    async (orgId: string) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const res = await fetchOrgMembers(token, orgId);
        setState((s) => ({ ...s, members: res?.data ?? [], loading: false }));
      } catch (err) {
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load members",
        }));
      }
    },
    [token]
  );

  const inviteMember = useCallback(
    async (orgId: string, userId: string, roleId: string) => {
      const res = await addOrgMember(token, orgId, { userId, roleId });
      setState((s) => ({ ...s, members: [...s.members, res.data] }));
      return res.data;
    },
    [token]
  );

  const kickMember = useCallback(
    async (orgId: string, userId: string) => {
      await removeOrgMember(token, orgId, userId);
      setState((s) => ({
        ...s,
        members: s.members.filter((m: any) => m.userId !== userId && m.user?.id !== userId),
      }));
    },
    [token]
  );

  return {
    orgs: state.orgs,
    members: state.members,
    loading: state.loading,
    error: state.error,
    loadOrgs,
    loadMembers,
    inviteMember,
    kickMember,
  };
}
