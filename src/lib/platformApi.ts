/**
 * Platform-level API functions + data mappers for the Afrisinc Control frontend.
 *
 * Every function tries the real backend and throws on failure.
 * Callers wrap calls in try/catch and fall back to seed data.
 */

import { apiFetch, API_BASE } from './api';
import type {
  ControlProduct,
  TeamMember,
  ControlRole,
  Permission,
} from '@/contexts/PlatformContext';
import { TEAM_MEMBERS } from '@/contexts/PlatformContext';

// ── Backend response shapes ──────────────────────────────────────────────────

export interface BackendProduct {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: string; // PROVISIONING | ACTIVE | SUSPENDED | DEPRECATED | COMING_SOON | BETA | LIVE
  baseUrl?: string;
  createdAt: string;
}

export interface BackendEnrollmentStat {
  productId: string;
  productName: string;
  productCode: string;
  totalEnrollments: number;
  active: number;
  suspended: number;
  plans: { FREE: number; PRO: number; ENTERPRISE: number };
}

export interface BackendUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DORMANT' | 'CLOSED' | 'SUSPENDED';
  createdAt: string;
  lastLogin?: string | null;
}

export interface BackendRole {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface BackendPermission {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

export interface BackendSidebarItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  order: number;
  isActive: boolean;
  parentId?: string | null;
  children?: BackendSidebarItem[];
}

// ── Data mappers ─────────────────────────────────────────────────────────────

const ACTIVE_PRODUCT_STATUSES = new Set([
  'ACTIVE', 'LIVE', 'BETA', 'PROVISIONING',
]);

function mapProductStatus(status: string): 'Active' | 'Inactive' {
  return ACTIVE_PRODUCT_STATUSES.has(status) ? 'Active' : 'Inactive';
}

/** Map a full backend Product or an enrollment-stat object to ControlProduct. */
export function mapBackendProduct(
  p: BackendProduct | BackendEnrollmentStat
): ControlProduct {
  if ('productId' in p) {
    // Enrollment stat shape — only has id/name/code, fill in the rest
    return {
      id: p.productId,
      name: p.productName,
      code: p.productCode,
      description: '',
      status: 'Active',
      supportEmail: `support-${p.productCode.toLowerCase()}@afrisinc.com`,
      createdAt: new Date().toISOString().split('T')[0],
    };
  }
  return {
    id: p.id,
    name: p.name,
    code: p.code,
    description: p.description ?? '',
    status: mapProductStatus(p.status),
    supportEmail: `support-${p.code.toLowerCase()}@afrisinc.com`,
    createdAt: p.createdAt.split('T')[0],
  };
}

function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

const USER_STATUS_MAP: Record<BackendUser['status'], TeamMember['status']> = {
  ACTIVE:   'Active',
  SUSPENDED:'Locked',
  INACTIVE: 'Inactive',
  DORMANT:  'Inactive',
  CLOSED:   'Inactive',
};

/**
 * Map a backend User to a TeamMember.
 * Role and productAccess are enriched from the seed data by email
 * (because the backend's role is tied to OrganizationMember, not the User record directly).
 */
export function mapBackendUser(u: BackendUser): TeamMember {
  const seed = TEAM_MEMBERS.find(
    (m) => m.email.toLowerCase() === u.email.toLowerCase()
  );
  const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email;
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return {
    id: u.id,
    name,
    email: u.email,
    role: seed?.role ?? 'support_agent',
    productAccess: seed?.productAccess ?? [],
    status: USER_STATUS_MAP[u.status] ?? 'Inactive',
    lastLogin: u.lastLogin
      ? formatRelativeTime(u.lastLogin)
      : seed?.lastLogin ?? 'Never',
    joinedAt: u.createdAt.split('T')[0],
    avatar: initials || seed?.avatar || '??',
  };
}

/** Normalise backend role name "SUPER_ADMIN" → frontend ControlRole "super_admin". */
export function normalizeRoleName(name: string): ControlRole {
  return name.toLowerCase() as ControlRole;
}

// ── Auth flow ─────────────────────────────────────────────────────────────────

export interface BackendLoginResult {
  userId: string;
  email: string;
  accountIds: string[];
  token: string;
  firstName: string;
  lastName: string;
}

/**
 * Complete backend login flow:
 *   1. POST /auth/login            → authorization code
 *   2. POST /oauth/exchange        → JWT token
 *   3. GET  /users/profile         → user name fields (best-effort)
 *
 * Returns null if any step fails — caller should fall back to seed auth.
 */
export async function loginWithBackend(
  email: string,
  password: string
): Promise<BackendLoginResult | null> {
  try {
    // 1 — Login
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!loginRes.ok) return null;

    const loginJson = await loginRes.json();
    const loginData = loginJson.data ?? loginJson;
    if (!loginData?.code) return null;

    // 2 — Exchange authorization code for token
    const exchangeRes = await fetch(`${API_BASE}/oauth/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: loginData.code }),
    });
    if (!exchangeRes.ok) return null;

    const exchangeJson = await exchangeRes.json();
    const tokenData = exchangeJson.data ?? exchangeJson;
    if (!tokenData?.token) return null;

    const token: string = tokenData.token;
    const userId: string = tokenData.user_id ?? loginData.user_id;
    const accountIds: string[] = tokenData.account_ids ?? loginData.account_ids ?? [];

    // 3 — Fetch profile (best-effort, don't fail if this errors)
    let firstName = '';
    let lastName = '';
    try {
      const profileRes = await fetch(`${API_BASE}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (profileRes.ok) {
        const profileJson = await profileRes.json();
        const profile = profileJson.data ?? profileJson;
        firstName = profile.firstName ?? '';
        lastName = profile.lastName ?? '';
      }
    } catch {
      // profile fetch failed — name fields stay empty, caller uses seed data
    }

    return { userId, email, accountIds, token, firstName, lastName };
  } catch {
    return null;
  }
}

// ── Products ──────────────────────────────────────────────────────────────────

/**
 * Fetch all products with enrollment stats.
 * Requires a valid JWT (auth-service `base` token).
 * Throws if the backend is unreachable or returns an empty list.
 */
export async function fetchProducts(token: string): Promise<ControlProduct[]> {
  const stats = await apiFetch<BackendEnrollmentStat[]>(
    '/products/enrollments',
    {},
    token
  );
  if (!Array.isArray(stats) || stats.length === 0) throw new Error('empty');
  return stats.map(mapBackendProduct);
}

/**
 * Fetch public products (LIVE / COMING_SOON / BETA).
 * No auth required — useful as a fallback when the user has no token yet.
 */
export async function fetchPublicProducts(): Promise<ControlProduct[]> {
  const products = await apiFetch<BackendProduct[]>('/products/public', {}, null);
  if (!Array.isArray(products) || products.length === 0) throw new Error('empty');
  return products.map(mapBackendProduct);
}

/**
 * Create a new product via the backend.
 * Returns the created ControlProduct, or null on failure (caller keeps local state).
 */
export async function createProductOnBackend(
  token: string,
  data: { name: string; code: string; description?: string }
): Promise<ControlProduct | null> {
  try {
    const result = await apiFetch<BackendProduct>(
      '/products',
      { method: 'POST', body: JSON.stringify(data) },
      token
    );
    return mapBackendProduct(result);
  } catch {
    return null;
  }
}

// ── Users ─────────────────────────────────────────────────────────────────────

/**
 * Fetch all users (up to 100 per page).
 * Throws if backend is unreachable or returns an empty list.
 */
export async function fetchAllUsers(token: string): Promise<TeamMember[]> {
  const result = await apiFetch<{ data: BackendUser[] } | BackendUser[]>(
    '/users?limit=100',
    {},
    token
  );
  // Response can be { data: [...] } or an array directly depending on backend version
  const users: BackendUser[] = Array.isArray(result)
    ? result
    : ((result as any).data ?? []);
  if (users.length === 0) throw new Error('empty');
  return users.map(mapBackendUser);
}

// ── Roles & Permissions ───────────────────────────────────────────────────────

/** Fetch all roles from the backend. */
export async function fetchRoles(token: string): Promise<BackendRole[]> {
  const result = await apiFetch<any>('/api/admin/roles?limit=50', {}, token);
  // Response shape from RoleRepository.findAll: { roles, total, page, pages }
  const roles: BackendRole[] = result?.roles ?? result?.data ?? result;
  if (!Array.isArray(roles)) throw new Error('unexpected shape');
  return roles;
}

/**
 * Resolve the backend role UUID for a given ControlRole name.
 * Returns null if not found or on error.
 */
export async function resolveRoleId(
  token: string,
  roleName: ControlRole
): Promise<string | null> {
  try {
    const roles = await fetchRoles(token);
    const match = roles.find(
      (r) => normalizeRoleName(r.name) === roleName
    );
    return match?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetch the permissions assigned to a role.
 * Returns permission names matching our Permission type.
 */
export async function fetchRolePermissions(
  token: string,
  roleId: string
): Promise<Permission[]> {
  const result = await apiFetch<any>(
    `/api/admin/roles/${roleId}/permissions`,
    {},
    token
  );
  const perms: BackendPermission[] = Array.isArray(result)
    ? result
    : result?.permissions ?? result?.data ?? [];
  // Backend permission names are identical to our Permission type strings
  return perms.map((p) => p.name as Permission);
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

/**
 * Fetch the sidebar items assigned to a role.
 * Returns only active items, sorted by `order`.
 */
export async function fetchRoleSidebarItems(
  token: string,
  roleId: string
): Promise<BackendSidebarItem[]> {
  const result = await apiFetch<any>(
    `/api/admin/roles/${roleId}/sidebar-items`,
    {},
    token
  );
  const items: BackendSidebarItem[] = Array.isArray(result)
    ? result
    : result?.sidebarItems ?? result?.items ?? result?.data ?? [];
  return items
    .filter((i) => i.isActive !== false)
    .sort((a, b) => a.order - b.order);
}
