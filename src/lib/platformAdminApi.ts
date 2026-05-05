/**
 * Platform Admin API Client
 * Handles all admin-level API operations: roles, permissions, sidebar items
 */

import { API_BASE } from './api';
import type {
  Role,
  Permission,
  SidebarItem,
  CreateRoleRequest,
  UpdateRoleRequest,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  CreateSidebarItemRequest,
  UpdateSidebarItemRequest,
  AssignPermissionsRequest,
  AssignSidebarItemsRequest,
  RolesListResponse,
  PermissionsListResponse,
  SidebarItemsListResponse,
  RolePermissionsResponse,
  RoleSidebarItemsResponse,
} from '@/types/admin';

const ADMIN_BASE = `${API_BASE}/api/admin`;

// ──── Helper Function ───────────────────────────────────────────────────────

async function adminFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  token: string
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${ADMIN_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.resp_msg || `Request failed: ${response.status}`);
  }

  return response.json();
}

// ──── ROLE MANAGEMENT ────────────────────────────────────────────────────────

/**
 * Fetch all roles with pagination
 */
export async function fetchRoles(
  token: string,
  page: number = 1,
  limit: number = 50
): Promise<RolesListResponse> {
  return adminFetch(
    `/roles?page=${page}&limit=${limit}`,
    { method: 'GET' },
    token
  );
}

/**
 * Fetch single role
 */
export async function fetchRole(
  token: string,
  roleId: string
): Promise<{ success: boolean; resp_code: number; resp_msg: string; data: Role }> {
  return adminFetch(`/roles/${roleId}`, { method: 'GET' }, token);
}

/**
 * Create new role
 */
export async function createRole(
  token: string,
  data: CreateRoleRequest
): Promise<{ success: boolean; resp_code: number; resp_msg: string; data: Role }> {
  return adminFetch('/roles', { method: 'POST', body: JSON.stringify(data) }, token);
}

/**
 * Update role
 */
export async function updateRole(
  token: string,
  roleId: string,
  data: UpdateRoleRequest
): Promise<{ success: boolean; resp_code: number; resp_msg: string; data: Role }> {
  return adminFetch(`/roles/${roleId}`, { method: 'PUT', body: JSON.stringify(data) }, token);
}

/**
 * Delete role
 */
export async function deleteRole(token: string, roleId: string): Promise<{ success: boolean; resp_code: number; resp_msg: string }> {
  return adminFetch(`/roles/${roleId}`, { method: 'DELETE' }, token);
}

// ──── PERMISSION MANAGEMENT ─────────────────────────────────────────────────

/**
 * Fetch all permissions with pagination
 */
export async function fetchPermissions(
  token: string,
  page: number = 1,
  limit: number = 100,
  category?: string
): Promise<PermissionsListResponse> {
  let url = `/permissions?page=${page}&limit=${limit}`;
  if (category) {
    url += `&category=${encodeURIComponent(category)}`;
  }
  return adminFetch(url, { method: 'GET' }, token);
}

/**
 * Fetch single permission
 */
export async function fetchPermission(
  token: string,
  permissionId: string
): Promise<{ success: boolean; resp_code: number; resp_msg: string; data: Permission }> {
  return adminFetch(`/permissions/${permissionId}`, { method: 'GET' }, token);
}

/**
 * Create new permission
 */
export async function createPermission(
  token: string,
  data: CreatePermissionRequest
): Promise<{ success: boolean; resp_code: number; resp_msg: string; data: Permission }> {
  return adminFetch('/permissions', { method: 'POST', body: JSON.stringify(data) }, token);
}

/**
 * Update permission
 */
export async function updatePermission(
  token: string,
  permissionId: string,
  data: UpdatePermissionRequest
): Promise<{ success: boolean; resp_code: number; resp_msg: string; data: Permission }> {
  return adminFetch(
    `/permissions/${permissionId}`,
    { method: 'PUT', body: JSON.stringify(data) },
    token
  );
}

/**
 * Delete permission
 */
export async function deletePermission(
  token: string,
  permissionId: string
): Promise<{ success: boolean; resp_code: number; resp_msg: string }> {
  return adminFetch(`/permissions/${permissionId}`, { method: 'DELETE' }, token);
}

// ──── ROLE-PERMISSION ASSIGNMENT ────────────────────────────────────────────

/**
 * Fetch permissions for a role
 */
export async function fetchRolePermissions(
  token: string,
  roleId: string
): Promise<RolePermissionsResponse> {
  return adminFetch(`/roles/${roleId}/permissions`, { method: 'GET' }, token);
}

/**
 * Assign permissions to role (bulk replace)
 */
export async function assignPermissionsToRole(
  token: string,
  roleId: string,
  data: AssignPermissionsRequest
): Promise<{ success: boolean; resp_code: number; resp_msg: string }> {
  return adminFetch(
    `/roles/${roleId}/permissions`,
    { method: 'POST', body: JSON.stringify(data) },
    token
  );
}

/**
 * Add single permission to role
 */
export async function addPermissionToRole(
  token: string,
  roleId: string,
  permissionId: string
): Promise<{ success: boolean; resp_code: number; resp_msg: string }> {
  return adminFetch(
    `/roles/${roleId}/permissions/${permissionId}`,
    { method: 'POST' },
    token
  );
}

/**
 * Remove permission from role
 */
export async function removePermissionFromRole(
  token: string,
  roleId: string,
  permissionId: string
): Promise<{ success: boolean; resp_code: number; resp_msg: string }> {
  return adminFetch(
    `/roles/${roleId}/permissions/${permissionId}`,
    { method: 'DELETE' },
    token
  );
}

// ──── SIDEBAR ITEM MANAGEMENT ────────────────────────────────────────────────

/**
 * Fetch all sidebar items with pagination
 */
export async function fetchSidebarItems(
  token: string,
  page: number = 1,
  limit: number = 100,
  parentId?: string
): Promise<SidebarItemsListResponse> {
  let url = `/sidebar-items?page=${page}&limit=${limit}`;
  if (parentId) {
    url += `&parentId=${encodeURIComponent(parentId)}`;
  }
  return adminFetch(url, { method: 'GET' }, token);
}

/**
 * Fetch single sidebar item
 */
export async function fetchSidebarItem(
  token: string,
  itemId: string
): Promise<{ success: boolean; resp_code: number; resp_msg: string; data: SidebarItem }> {
  return adminFetch(`/sidebar-items/${itemId}`, { method: 'GET' }, token);
}

/**
 * Create new sidebar item
 */
export async function createSidebarItem(
  token: string,
  data: CreateSidebarItemRequest
): Promise<{ success: boolean; resp_code: number; resp_msg: string; data: SidebarItem }> {
  return adminFetch('/sidebar-items', { method: 'POST', body: JSON.stringify(data) }, token);
}

/**
 * Update sidebar item
 */
export async function updateSidebarItem(
  token: string,
  itemId: string,
  data: UpdateSidebarItemRequest
): Promise<{ success: boolean; resp_code: number; resp_msg: string; data: SidebarItem }> {
  return adminFetch(
    `/sidebar-items/${itemId}`,
    { method: 'PUT', body: JSON.stringify(data) },
    token
  );
}

/**
 * Delete sidebar item
 */
export async function deleteSidebarItem(
  token: string,
  itemId: string
): Promise<{ success: boolean; resp_code: number; resp_msg: string }> {
  return adminFetch(`/sidebar-items/${itemId}`, { method: 'DELETE' }, token);
}

// ──── ROLE-SIDEBAR ASSIGNMENT ────────────────────────────────────────────────

/**
 * Fetch sidebar items for a role
 */
export async function fetchRoleSidebarItems(
  token: string,
  roleId: string
): Promise<RoleSidebarItemsResponse> {
  return adminFetch(`/roles/${roleId}/sidebar-items`, { method: 'GET' }, token);
}

/**
 * Assign sidebar items to role (bulk replace)
 */
export async function assignSidebarItemsToRole(
  token: string,
  roleId: string,
  data: AssignSidebarItemsRequest
): Promise<{ success: boolean; resp_code: number; resp_msg: string }> {
  return adminFetch(
    `/roles/${roleId}/sidebar-items`,
    { method: 'POST', body: JSON.stringify(data) },
    token
  );
}

/**
 * Add single sidebar item to role
 */
export async function addSidebarItemToRole(
  token: string,
  roleId: string,
  itemId: string
): Promise<{ success: boolean; resp_code: number; resp_msg: string }> {
  return adminFetch(
    `/roles/${roleId}/sidebar-items/${itemId}`,
    { method: 'POST' },
    token
  );
}

/**
 * Remove sidebar item from role
 */
export async function removeSidebarItemFromRole(
  token: string,
  roleId: string,
  itemId: string
): Promise<{ success: boolean; resp_code: number; resp_msg: string }> {
  return adminFetch(
    `/roles/${roleId}/sidebar-items/${itemId}`,
    { method: 'DELETE' },
    token
  );
}
