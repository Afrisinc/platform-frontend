/**
 * useAdminPermissions Hook
 * Custom hook for managing permissions
 */

import { useState, useCallback } from "react";
import type { Permission } from "@/types/admin";
import {
  fetchPermissions,
  createPermission,
  updatePermission,
  deletePermission,
} from "@/lib/platformAdminApi";

interface UseAdminPermissionsState {
  permissions: Permission[];
  loading: boolean;
  error: string | null;
  page: number;
  total: number;
  totalPages: number;
}

export function useAdminPermissions(token: string) {
  const [state, setState] = useState<UseAdminPermissionsState>({
    permissions: [],
    loading: false,
    error: null,
    page: 1,
    total: 0,
    totalPages: 0,
  });

  const loadPermissions = useCallback(
    async (page: number = 1, limit: number = 100, category?: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await fetchPermissions(token, page, limit, category);
        setState((prev) => ({
          ...prev,
          permissions: response.data.permissions,
          page: response.data.page,
          total: response.data.total,
          totalPages: response.data.pages,
          loading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Failed to load permissions",
          loading: false,
        }));
      }
    },
    [token]
  );

  const handleCreatePermission = useCallback(
    async (name: string, description?: string, category?: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await createPermission(token, { name, description, category });
        setState((prev) => ({
          ...prev,
          permissions: [response.data, ...prev.permissions],
          loading: false,
        }));
        return response.data;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Failed to create permission",
          loading: false,
        }));
        throw error;
      }
    },
    [token]
  );

  const handleUpdatePermission = useCallback(
    async (permissionId: string, name?: string, description?: string, category?: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await updatePermission(token, permissionId, {
          name,
          description,
          category,
        });
        setState((prev) => ({
          ...prev,
          permissions: prev.permissions.map((p) => (p.id === permissionId ? response.data : p)),
          loading: false,
        }));
        return response.data;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Failed to update permission",
          loading: false,
        }));
        throw error;
      }
    },
    [token]
  );

  const handleDeletePermission = useCallback(
    async (permissionId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        await deletePermission(token, permissionId);
        setState((prev) => ({
          ...prev,
          permissions: prev.permissions.filter((p) => p.id !== permissionId),
          loading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Failed to delete permission",
          loading: false,
        }));
        throw error;
      }
    },
    [token]
  );

  return {
    permissions: state.permissions,
    loading: state.loading,
    error: state.error,
    page: state.page,
    total: state.total,
    totalPages: state.totalPages,
    loadPermissions,
    createPermission: handleCreatePermission,
    updatePermission: handleUpdatePermission,
    deletePermission: handleDeletePermission,
  };
}
