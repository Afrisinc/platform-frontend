/**
 * Notify Admin Service
 * Calls the API Gateway notification admin endpoints.
 * Transforms snake_case backend responses → camelCase frontend types.
 */

import { apiFetch } from "@/lib/api";
import type {
  NotifyPlan,
  PlanLimit,
  NotifyUser,
  NotifyAccount,
  AccountLimitOverride,
  AccountLimitsResponse,
  SetLimitOverridePayload,
} from "@/types/notifyAdmin";

// ── Response mappers ─────────────────────────────────────────────────────────

/** Map raw backend plan limit (snake_case) → PlanLimit */
function mapLimit(raw: any): PlanLimit {
  const rawVal = raw.limit_value ?? raw.value;
  return {
    metric: raw.metric ?? "",
    value: rawVal === null || rawVal === undefined ? -1 : Number(rawVal),
    label: raw.metric ?? "",
    unit: raw.period ?? raw.unit,
  };
}

/** Map raw backend plan → NotifyPlan */
function mapPlan(raw: any): NotifyPlan {
  return {
    id: raw.id ?? "",
    name: raw.name ?? "",
    displayName: raw.display_name ?? raw.displayName ?? raw.name ?? "",
    description: raw.description ?? undefined,
    priceMonthly: raw.price_monthly ?? raw.priceMonthly ?? 0,
    priceYearly: raw.price_yearly ?? raw.priceYearly ?? 0,
    isActive: raw.is_active ?? raw.isActive ?? true,
    isDefault: raw.is_default ?? raw.isDefault ?? false,
    limits: (raw.limits ?? []).map(mapLimit),
    features: raw.features ?? [],
    createdAt: raw.created_at ?? raw.createdAt ?? "",
    updatedAt: raw.updated_at ?? raw.updatedAt ?? undefined,
  };
}

/** Map raw backend limit override → AccountLimitOverride */
function mapOverride(raw: any): AccountLimitOverride {
  return {
    id: raw.id ?? "",
    metric: raw.metric ?? "",
    planLimit: raw.plan_limit ?? raw.planLimit ?? 0,
    temporaryLimit: raw.temporary_limit ?? raw.temporaryLimit ?? 0,
    expiresAt: raw.expires_at ?? raw.expiresAt ?? undefined,
    isActive: raw.is_active ?? raw.isActive ?? true,
  };
}

/**
 * Map raw backend user (from analytics/users endpoint) → NotifyUser.
 * The accounts list does NOT include plan/subscription info.
 */
function mapUser(raw: any): NotifyUser {
  return {
    id: raw.id ?? "",
    email: raw.email ?? "",
    firstName: raw.firstName ?? raw.first_name ?? undefined,
    lastName: raw.lastName ?? raw.last_name ?? undefined,
    phone: raw.phone ?? undefined,
    emailVerified: raw.emailVerified ?? raw.email_verified ?? undefined,
    createdAt: raw.createdAt ?? raw.created_at ?? "",
    lastActivity: raw.lastActivity ?? raw.last_activity ?? undefined,
    accounts: (raw.accounts ?? []).map((a: any) => ({
      id: a.id ?? "",
      type: a.type ?? "INDIVIDUAL",
      organization: a.organization ?? null,
      createdAt: a.createdAt ?? a.created_at ?? "",
    })),
  };
}

/**
 * Flatten a NotifyUser into one NotifyAccount per account, for the accounts table UI.
 * Plan info is not available from this endpoint — shows as 'UNKNOWN'.
 */
function flattenUserToAccounts(user: NotifyUser): NotifyAccount[] {
  if (user.accounts.length === 0) {
    // Include users without accounts so support can see them
    return [
      {
        accountId: user.id,
        userId: user.id,
        userEmail: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        orgId: undefined,
        orgName: undefined,
        plan: "FREE",
        billingCycle: "monthly",
        status: "active",
        usage: [],
        createdAt: user.createdAt,
        lastActiveAt: user.lastActivity,
      },
    ];
  }
  return user.accounts.map((acc) => ({
    accountId: acc.id,
    userId: user.id,
    userEmail: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    orgId: acc.organization?.id,
    orgName: acc.organization?.name,
    plan: "FREE", // not available from this endpoint
    billingCycle: "monthly",
    status: "active",
    usage: [],
    createdAt: acc.createdAt,
    lastActiveAt: user.lastActivity,
  }));
}

// ── Plans ────────────────────────────────────────────────────────────────────

export async function fetchNotifyPlans(token: string): Promise<NotifyPlan[]> {
  const result = await apiFetch<any>("/notifications/plans", {}, token);
  // Backend returns { success, data: [...plans] } or { success, data: { data: [...] }, meta }
  const raw: any[] = result?.data ?? result?.plans ?? (Array.isArray(result) ? result : []);
  return raw.map(mapPlan);
}

// ── Accounts / Users ─────────────────────────────────────────────────────────

export async function fetchNotifyUsers(token: string, page = 1, limit = 50): Promise<NotifyUser[]> {
  const result = await apiFetch<any>(
    `/notifications/accounts?page=${page}&limit=${limit}`,
    {},
    token
  );
  // Platform analytics users endpoint returns { success, data: { data: [...users], meta } }
  const items: any[] = result?.data?.data ?? result?.data ?? (Array.isArray(result) ? result : []);
  return items.map(mapUser);
}

/**
 * Flatten users into accounts for the accounts table.
 * Filters by email search query if provided.
 */
export async function fetchNotifyAccounts(
  token: string,
  page = 1,
  limit = 50,
  search?: string
): Promise<NotifyAccount[]> {
  const users = await fetchNotifyUsers(token, page, limit);
  const accounts = users.flatMap(flattenUserToAccounts);
  if (!search) return accounts;
  const q = search.toLowerCase();
  return accounts.filter(
    (a) =>
      a.userEmail.toLowerCase().includes(q) ||
      (a.orgName ?? "").toLowerCase().includes(q) ||
      (a.firstName ?? "").toLowerCase().includes(q) ||
      (a.lastName ?? "").toLowerCase().includes(q)
  );
}

// ── Account Limit Overrides ──────────────────────────────────────────────────

export async function fetchAccountLimitOverrides(
  token: string,
  accountId: string
): Promise<AccountLimitsResponse> {
  const result = await apiFetch<any>(`/notifications/accounts/${accountId}/limits`, {}, token);
  const raw: any[] = result?.data ?? (Array.isArray(result) ? result : []);
  return {
    accountId,
    overrides: raw.map(mapOverride),
  };
}

export async function setAccountLimitOverride(
  token: string,
  accountId: string,
  payload: SetLimitOverridePayload
): Promise<AccountLimitOverride> {
  const result = await apiFetch<any>(
    `/notifications/accounts/${accountId}/limits/override`,
    { method: "POST", body: JSON.stringify(payload) },
    token
  );
  return mapOverride(result?.data ?? result);
}

export async function removeAccountLimitOverride(
  token: string,
  accountId: string,
  metric: string
): Promise<void> {
  await apiFetch<any>(
    `/notifications/accounts/${accountId}/limits/override/${metric}`,
    { method: "DELETE" },
    token
  );
}
