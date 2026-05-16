/**
 * Platform Admin API Client
 * Handles all admin-level API operations: roles, permissions, sidebar items
 */

import { API_BASE } from "./api";
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
} from "@/types/admin";

const ADMIN_BASE = `${API_BASE}/api/admin`;

// ──── Helper Function ───────────────────────────────────────────────────────

async function adminFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  token: string
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
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
  return adminFetch(`/roles?page=${page}&limit=${limit}`, { method: "GET" }, token);
}

/**
 * Fetch single role
 */
export async function fetchRole(
  token: string,
  roleId: string
): Promise<{ success: boolean; resp_code: number; resp_msg: string; data: Role }> {
  return adminFetch(`/roles/${roleId}`, { method: "GET" }, token);
}

/**
 * Create new role
 */
export async function createRole(
  token: string,
  data: CreateRoleRequest
): Promise<{ success: boolean; resp_code: number; resp_msg: string; data: Role }> {
  return adminFetch("/roles", { method: "POST", body: JSON.stringify(data) }, token);
}

/**
 * Update role
 */
export async function updateRole(
  token: string,
  roleId: string,
  data: UpdateRoleRequest
): Promise<{ success: boolean; resp_code: number; resp_msg: string; data: Role }> {
  return adminFetch(`/roles/${roleId}`, { method: "PUT", body: JSON.stringify(data) }, token);
}

/**
 * Delete role
 */
export async function deleteRole(
  token: string,
  roleId: string
): Promise<{ success: boolean; resp_code: number; resp_msg: string }> {
  return adminFetch(`/roles/${roleId}`, { method: "DELETE" }, token);
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
  return adminFetch(url, { method: "GET" }, token);
}

/**
 * Fetch single permission
 */
export async function fetchPermission(
  token: string,
  permissionId: string
): Promise<{ success: boolean; resp_code: number; resp_msg: string; data: Permission }> {
  return adminFetch(`/permissions/${permissionId}`, { method: "GET" }, token);
}

/**
 * Create new permission
 */
export async function createPermission(
  token: string,
  data: CreatePermissionRequest
): Promise<{ success: boolean; resp_code: number; resp_msg: string; data: Permission }> {
  return adminFetch("/permissions", { method: "POST", body: JSON.stringify(data) }, token);
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
    { method: "PUT", body: JSON.stringify(data) },
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
  return adminFetch(`/permissions/${permissionId}`, { method: "DELETE" }, token);
}

// ──── ROLE-PERMISSION ASSIGNMENT ────────────────────────────────────────────

/**
 * Fetch permissions for a role
 */
export async function fetchRolePermissions(
  token: string,
  roleId: string
): Promise<RolePermissionsResponse> {
  return adminFetch(`/roles/${roleId}/permissions`, { method: "GET" }, token);
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
    { method: "POST", body: JSON.stringify(data) },
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
  return adminFetch(`/roles/${roleId}/permissions/${permissionId}`, { method: "POST" }, token);
}

/**
 * Remove permission from role
 */
export async function removePermissionFromRole(
  token: string,
  roleId: string,
  permissionId: string
): Promise<{ success: boolean; resp_code: number; resp_msg: string }> {
  return adminFetch(`/roles/${roleId}/permissions/${permissionId}`, { method: "DELETE" }, token);
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
  return adminFetch(url, { method: "GET" }, token);
}

/**
 * Fetch single sidebar item
 */
export async function fetchSidebarItem(
  token: string,
  itemId: string
): Promise<{ success: boolean; resp_code: number; resp_msg: string; data: SidebarItem }> {
  return adminFetch(`/sidebar-items/${itemId}`, { method: "GET" }, token);
}

/**
 * Create new sidebar item
 */
export async function createSidebarItem(
  token: string,
  data: CreateSidebarItemRequest
): Promise<{ success: boolean; resp_code: number; resp_msg: string; data: SidebarItem }> {
  return adminFetch("/sidebar-items", { method: "POST", body: JSON.stringify(data) }, token);
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
    { method: "PUT", body: JSON.stringify(data) },
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
  return adminFetch(`/sidebar-items/${itemId}`, { method: "DELETE" }, token);
}

// ──── ROLE-SIDEBAR ASSIGNMENT ────────────────────────────────────────────────

/**
 * Fetch sidebar items for a role
 */
export async function fetchRoleSidebarItems(
  token: string,
  roleId: string
): Promise<RoleSidebarItemsResponse> {
  return adminFetch(`/roles/${roleId}/sidebar-items`, { method: "GET" }, token);
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
    { method: "POST", body: JSON.stringify(data) },
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
  return adminFetch(`/roles/${roleId}/sidebar-items/${itemId}`, { method: "POST" }, token);
}

/**
 * Remove sidebar item from role
 */
export async function removeSidebarItemFromRole(
  token: string,
  roleId: string,
  itemId: string
): Promise<{ success: boolean; resp_code: number; resp_msg: string }> {
  return adminFetch(`/roles/${roleId}/sidebar-items/${itemId}`, { method: "DELETE" }, token);
}

// ──── PLATFORM USERS (admin) ─────────────────────────────────────────────────

export async function fetchAdminUsers(
  token: string,
  page = 1,
  limit = 50,
  search?: string,
  status?: string
): Promise<{
  success: boolean;
  resp_code: number;
  resp_msg: string;
  data: { users: any[]; total: number; page: number; pages: number };
}> {
  let url = `/users?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (status) url += `&status=${encodeURIComponent(status)}`;
  return adminFetch(url, { method: "GET" }, token);
}

export async function updateAdminUserStatus(
  token: string,
  userId: string,
  status: string
): Promise<{ success: boolean; resp_code: number; resp_msg: string; data: any }> {
  return adminFetch(
    `/users/${userId}/status`,
    { method: "PUT", body: JSON.stringify({ status }) },
    token
  );
}

// ──── ORGANIZATIONS (admin) ──────────────────────────────────────────────────

export async function fetchAdminOrganizations(
  token: string,
  page = 1,
  limit = 50,
  search?: string
): Promise<{ success: boolean; resp_code: number; resp_msg: string; data: any[] }> {
  let url = `/organizations?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  return adminFetch(url, { method: "GET" }, token);
}

export async function fetchOrgMembers(
  token: string,
  orgId: string
): Promise<{ success: boolean; resp_code: number; resp_msg: string; data: any[] }> {
  return adminFetch(`/organizations/${orgId}/members`, { method: "GET" }, token);
}

export async function addOrgMember(
  token: string,
  orgId: string,
  payload: { userId: string; roleId: string }
): Promise<{ success: boolean; resp_code: number; resp_msg: string; data: any }> {
  return adminFetch(
    `/organizations/${orgId}/members`,
    { method: "POST", body: JSON.stringify(payload) },
    token
  );
}

export async function removeOrgMember(
  token: string,
  orgId: string,
  userId: string
): Promise<{ success: boolean; resp_code: number; resp_msg: string }> {
  return adminFetch(`/organizations/${orgId}/members/${userId}`, { method: "DELETE" }, token);
}

// ──── PRODUCTS (admin) ───────────────────────────────────────────────────────

export async function fetchAdminProducts(
  token: string
): Promise<{ success: boolean; resp_code: number; resp_msg: string; data: any[] }> {
  return adminFetch("/products", { method: "GET" }, token);
}

export async function createAdminProduct(
  token: string,
  payload: { name: string; code: string; description?: string; baseUrl?: string; status?: string }
): Promise<{ success: boolean; resp_code: number; resp_msg: string; data: any }> {
  return adminFetch("/products", { method: "POST", body: JSON.stringify(payload) }, token);
}

export async function updateAdminProduct(
  token: string,
  productId: string,
  payload: { name?: string; description?: string; baseUrl?: string; status?: string }
): Promise<{ success: boolean; resp_code: number; resp_msg: string; data: any }> {
  return adminFetch(
    `/products/${productId}`,
    { method: "PUT", body: JSON.stringify(payload) },
    token
  );
}

export async function fetchAdminProductEnrollments(
  token: string
): Promise<{ success: boolean; resp_code: number; resp_msg: string; data: any[] }> {
  return adminFetch("/products/enrollments", { method: "GET" }, token);
}

export async function fetchAdminProductAccounts(
  token: string,
  productId: string,
  page = 1,
  limit = 50,
  status?: string
): Promise<{ success: boolean; resp_code: number; resp_msg: string; data: any }> {
  let url = `/products/${productId}/accounts?page=${page}&limit=${limit}`;
  if (status) url += `&status=${encodeURIComponent(status)}`;
  return adminFetch(url, { method: "GET" }, token);
}
