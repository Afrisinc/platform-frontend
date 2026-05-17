/**
 * useAdminRoles Hook
 * Custom hook for managing roles
 */

import { useState, useCallback } from "react";
import type { Role } from "@/types/admin";
import { fetchRoles, createRole, updateRole, deleteRole } from "@/lib/platformAdminApi";

interface UseAdminRolesState {
  roles: Role[];
  loading: boolean;
  error: string | null;
  page: number;
  total: number;
  totalPages: number;
}

export function useAdminRoles(token: string) {
  const [state, setState] = useState<UseAdminRolesState>({
    roles: [],
    loading: false,
    error: null,
    page: 1,
    total: 0,
    totalPages: 0,
  });

  // Fetch roles
  const loadRoles = useCallback(
    async (page: number = 1, limit: number = 50) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await fetchRoles(token, page, limit);
        setState((prev) => ({
          ...prev,
          roles: response.data.roles,
          page: response.data.page,
          total: response.data.total,
          totalPages: response.data.pages,
          loading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Failed to load roles",
          loading: false,
        }));
      }
    },
    [token]
  );

  // Create role
  const handleCreateRole = useCallback(
    async (name: string, description?: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await createRole(token, { name, description });
        setState((prev) => ({
          ...prev,
          roles: [response.data, ...prev.roles],
          loading: false,
        }));
        return response.data;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Failed to create role",
          loading: false,
        }));
        throw error;
      }
    },
    [token]
  );

  // Update role
  const handleUpdateRole = useCallback(
    async (roleId: string, name?: string, description?: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await updateRole(token, roleId, { name, description });
        setState((prev) => ({
          ...prev,
          roles: prev.roles.map((r) => (r.id === roleId ? response.data : r)),
          loading: false,
        }));
        return response.data;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Failed to update role",
          loading: false,
        }));
        throw error;
      }
    },
    [token]
  );

  // Delete role
  const handleDeleteRole = useCallback(
    async (roleId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        await deleteRole(token, roleId);
        setState((prev) => ({
          ...prev,
          roles: prev.roles.filter((r) => r.id !== roleId),
          loading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Failed to delete role",
          loading: false,
        }));
        throw error;
      }
    },
    [token]
  );

  return {
    roles: state.roles,
    loading: state.loading,
    error: state.error,
    page: state.page,
    total: state.total,
    totalPages: state.totalPages,
    loadRoles,
    createRole: handleCreateRole,
    updateRole: handleUpdateRole,
    deleteRole: handleDeleteRole,
  };
}
