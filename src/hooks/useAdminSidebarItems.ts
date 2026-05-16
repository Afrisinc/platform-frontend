/**
 * useAdminSidebarItems Hook
 * Custom hook for managing sidebar items
 */

import { useState, useCallback } from "react";
import type { SidebarItem } from "@/types/admin";
import {
  fetchSidebarItems,
  createSidebarItem,
  updateSidebarItem,
  deleteSidebarItem,
} from "@/lib/platformAdminApi";

interface UseAdminSidebarItemsState {
  items: SidebarItem[];
  loading: boolean;
  error: string | null;
  page: number;
  total: number;
  totalPages: number;
}

export function useAdminSidebarItems(token: string) {
  const [state, setState] = useState<UseAdminSidebarItemsState>({
    items: [],
    loading: false,
    error: null,
    page: 1,
    total: 0,
    totalPages: 0,
  });

  const loadSidebarItems = useCallback(
    async (page: number = 1, limit: number = 100, parentId?: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await fetchSidebarItems(token, page, limit, parentId);
        setState((prev) => ({
          ...prev,
          items: response.data.sidebarItems,
          page: response.data.page,
          total: response.data.total,
          totalPages: response.data.pages,
          loading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Failed to load sidebar items",
          loading: false,
        }));
      }
    },
    [token]
  );

  const handleCreateSidebarItem = useCallback(
    async (
      label: string,
      icon?: string,
      path?: string,
      order?: number,
      parentId?: string | null
    ) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await createSidebarItem(token, { label, icon, path, order, parentId });
        setState((prev) => ({
          ...prev,
          items: [response.data, ...prev.items],
          loading: false,
        }));
        return response.data;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Failed to create sidebar item",
          loading: false,
        }));
        throw error;
      }
    },
    [token]
  );

  const handleUpdateSidebarItem = useCallback(
    async (itemId: string, updates: Partial<SidebarItem>) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await updateSidebarItem(token, itemId, updates);
        setState((prev) => ({
          ...prev,
          items: prev.items.map((item) => (item.id === itemId ? response.data : item)),
          loading: false,
        }));
        return response.data;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Failed to update sidebar item",
          loading: false,
        }));
        throw error;
      }
    },
    [token]
  );

  const handleDeleteSidebarItem = useCallback(
    async (itemId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        await deleteSidebarItem(token, itemId);
        setState((prev) => ({
          ...prev,
          items: prev.items.filter((item) => item.id !== itemId),
          loading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Failed to delete sidebar item",
          loading: false,
        }));
        throw error;
      }
    },
    [token]
  );

  return {
    items: state.items,
    loading: state.loading,
    error: state.error,
    page: state.page,
    total: state.total,
    totalPages: state.totalPages,
    loadSidebarItems,
    createSidebarItem: handleCreateSidebarItem,
    updateSidebarItem: handleUpdateSidebarItem,
    deleteSidebarItem: handleDeleteSidebarItem,
  };
}
