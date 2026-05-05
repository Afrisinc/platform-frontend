/**
 * Admin Management Types
 * Types for role, permission, sidebar, and user management
 */

// ──── Role Types ────────────────────────────────────────────────────────────

export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    organizationMembers?: number;
    rolePermissions?: number;
    roleSidebarItems?: number;
  };
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
}

export interface RoleResponse {
  success: boolean;
  resp_code: number;
  resp_msg: string;
  data: Role;
}

export interface RolesListResponse {
  success: boolean;
  resp_code: number;
  resp_msg: string;
  data: {
    roles: Role[];
    total: number;
    page: number;
    pages: number;
  };
}

// ──── Permission Types ──────────────────────────────────────────────────────

export interface Permission {
  id: string;
  name: string;
  description?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePermissionRequest {
  name: string;
  description?: string;
  category?: string;
}

export interface UpdatePermissionRequest {
  name?: string;
  description?: string;
  category?: string;
}

export interface PermissionResponse {
  success: boolean;
  resp_code: number;
  resp_msg: string;
  data: Permission;
}

export interface PermissionsListResponse {
  success: boolean;
  resp_code: number;
  resp_msg: string;
  data: {
    permissions: Permission[];
    total: number;
    page: number;
    pages: number;
  };
}

// ──── Sidebar Item Types ────────────────────────────────────────────────────

export interface SidebarItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  order: number;
  isActive: boolean;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  children?: SidebarItem[];
}

export interface CreateSidebarItemRequest {
  label: string;
  icon?: string;
  path?: string;
  order?: number;
  parentId?: string | null;
}

export interface UpdateSidebarItemRequest {
  label?: string;
  icon?: string;
  path?: string;
  order?: number;
  isActive?: boolean;
  parentId?: string | null;
}

export interface SidebarItemResponse {
  success: boolean;
  resp_code: number;
  resp_msg: string;
  data: SidebarItem;
}

export interface SidebarItemsListResponse {
  success: boolean;
  resp_code: number;
  resp_msg: string;
  data: {
    sidebarItems: SidebarItem[];
    total: number;
    page: number;
    pages: number;
  };
}

// ──── Role-Permission Assignment Types ──────────────────────────────────────

export interface RolePermissionAssignment {
  roleId: string;
  permissionIds: string[];
}

export interface AssignPermissionsRequest {
  permissionIds: string[];
}

export interface RolePermissionsResponse {
  success: boolean;
  resp_code: number;
  resp_msg: string;
  data: {
    permissions: Permission[];
  };
}

// ──── Role-Sidebar Assignment Types ────────────────────────────────────────

export interface RoleSidebarAssignment {
  roleId: string;
  sidebarItemIds: string[];
}

export interface AssignSidebarItemsRequest {
  sidebarItemIds: string[];
}

export interface RoleSidebarItemsResponse {
  success: boolean;
  resp_code: number;
  resp_msg: string;
  data: {
    sidebarItems: SidebarItem[];
  };
}

// ──── User Management Types ─────────────────────────────────────────────────

export interface InviteUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  productIds?: string[];
}

export interface UpdateUserRoleRequest {
  roleId: string;
  productIds?: string[];
}

export interface ResetPasswordRequest {
  userId: string;
}

export interface LockUnlockUserRequest {
  userId: string;
  locked: boolean;
}

export interface DeactivateUserRequest {
  userId: string;
  deactivate: boolean;
}

// ──── API Response Types ────────────────────────────────────────────────────

export interface ApiErrorResponse {
  success: false;
  resp_code: number;
  resp_msg: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface ApiSuccessResponse<T> {
  success: true;
  resp_code: number;
  resp_msg: string;
  data: T;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ──── Admin Dashboard Types ─────────────────────────────────────────────────

export interface AdminDashboardStats {
  totalRoles: number;
  totalPermissions: number;
  totalSidebarItems: number;
  totalUsers: number;
  activeRoles: number;
  lastModified: string;
}

// ──── Form State Types ──────────────────────────────────────────────────────

export interface FormError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: FormError[];
  isLoading: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

// ──── Table State Types ─────────────────────────────────────────────────────

export interface TableState {
  page: number;
  limit: number;
  total: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TableResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

// ──── Operation Status Types ────────────────────────────────────────────────

export type OperationStatus = 'idle' | 'loading' | 'success' | 'error';

export interface OperationResult {
  status: OperationStatus;
  message?: string;
  error?: string;
  data?: unknown;
}
