/**
 * useRoleAssignments Hook
 * Custom hook for managing role-permission and role-sidebar assignments
 */

import { useState, useCallback } from 'react';
import type { Permission, SidebarItem } from '@/types/admin';
import {
  fetchRolePermissions,
  assignPermissionsToRole,
  addPermissionToRole,
  removePermissionFromRole,
  fetchRoleSidebarItems,
  assignSidebarItemsToRole,
  addSidebarItemToRole,
  removeSidebarItemFromRole,
} from '@/lib/platformAdminApi';

interface UseRoleAssignmentsState {
  permissions: Permission[];
  sidebarItems: SidebarItem[];
  loading: boolean;
  error: string | null;
}

export function useRoleAssignments(token: string, roleId: string) {
  const [state, setState] = useState<UseRoleAssignmentsState>({
    permissions: [],
    sidebarItems: [],
    loading: false,
    error: null,
  });

  // Load role permissions
  const loadRolePermissions = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetchRolePermissions(token, roleId);
      setState((prev) => ({
        ...prev,
        permissions: response.data.permissions,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load permissions',
        loading: false,
      }));
    }
  }, [token, roleId]);

  // Load role sidebar items
  const loadRoleSidebarItems = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetchRoleSidebarItems(token, roleId);
      setState((prev) => ({
        ...prev,
        sidebarItems: response.data.sidebarItems,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load sidebar items',
        loading: false,
      }));
    }
  }, [token, roleId]);

  // Assign permissions (bulk)
  const handleAssignPermissions = useCallback(
    async (permissionIds: string[]) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        await assignPermissionsToRole(token, roleId, { permissionIds });
        await loadRolePermissions();
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to assign permissions',
          loading: false,
        }));
        throw error;
      }
    },
    [token, roleId, loadRolePermissions]
  );

  // Add single permission
  const handleAddPermission = useCallback(
    async (permissionId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        await addPermissionToRole(token, roleId, permissionId);
        await loadRolePermissions();
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to add permission',
          loading: false,
        }));
        throw error;
      }
    },
    [token, roleId, loadRolePermissions]
  );

  // Remove permission
  const handleRemovePermission = useCallback(
    async (permissionId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        await removePermissionFromRole(token, roleId, permissionId);
        setState((prev) => ({
          ...prev,
          permissions: prev.permissions.filter((p) => p.id !== permissionId),
          loading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to remove permission',
          loading: false,
        }));
        throw error;
      }
    },
    [token, roleId]
  );

  // Assign sidebar items (bulk)
  const handleAssignSidebarItems = useCallback(
    async (sidebarItemIds: string[]) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        await assignSidebarItemsToRole(token, roleId, { sidebarItemIds });
        await loadRoleSidebarItems();
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to assign sidebar items',
          loading: false,
        }));
        throw error;
      }
    },
    [token, roleId, loadRoleSidebarItems]
  );

  // Add single sidebar item
  const handleAddSidebarItem = useCallback(
    async (itemId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        await addSidebarItemToRole(token, roleId, itemId);
        await loadRoleSidebarItems();
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to add sidebar item',
          loading: false,
        }));
        throw error;
      }
    },
    [token, roleId, loadRoleSidebarItems]
  );

  // Remove sidebar item
  const handleRemoveSidebarItem = useCallback(
    async (itemId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        await removeSidebarItemFromRole(token, roleId, itemId);
        setState((prev) => ({
          ...prev,
          sidebarItems: prev.sidebarItems.filter((item) => item.id !== itemId),
          loading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to remove sidebar item',
          loading: false,
        }));
        throw error;
      }
    },
    [token, roleId]
  );

  return {
    permissions: state.permissions,
    sidebarItems: state.sidebarItems,
    loading: state.loading,
    error: state.error,
    loadRolePermissions,
    loadRoleSidebarItems,
    assignPermissions: handleAssignPermissions,
    addPermission: handleAddPermission,
    removePermission: handleRemovePermission,
    assignSidebarItems: handleAssignSidebarItems,
    addSidebarItem: handleAddSidebarItem,
    removeSidebarItem: handleRemoveSidebarItem,
  };
}
