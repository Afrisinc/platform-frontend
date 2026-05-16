/**
 * Notify Admin Types
 * Shapes returned by the API Gateway notification admin endpoints.
 */

// ── Plans ────────────────────────────────────────────────────────────────────

export type PlanName = "FREE" | "PRO" | "ENTERPRISE" | string;
export type BillingCycle = "monthly" | "yearly";

export interface PlanLimit {
  metric: string; // e.g. "emails_per_month", "sms_per_month", "contacts"
  value: number; // -1 = unlimited; null from backend maps to -1
  label: string; // human-readable, e.g. "Emails / month"
  unit?: string; // e.g. "emails", "contacts"
}

export interface NotifyPlan {
  id: string;
  name: PlanName;
  displayName: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  isActive: boolean;
  isDefault: boolean;
  limits: PlanLimit[];
  features: string[];
  createdAt: string;
  updatedAt?: string;
}

// ── Users / Accounts (from platform analytics users endpoint) ─────────────────

export interface NotifyUserAccount {
  id: string;
  type: "INDIVIDUAL" | "ORGANIZATION";
  organization: { id: string; name: string; createdAt: string } | null;
  createdAt: string;
}

export interface NotifyUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  emailVerified?: boolean;
  createdAt: string;
  lastActivity?: string;
  accounts: NotifyUserAccount[];
}

// ── Account limit overrides (from plan-management admin API) ─────────────────

export interface AccountLimitOverride {
  id: string;
  metric: string;
  planLimit: number; // -1 = unlimited
  temporaryLimit: number; // the override value
  expiresAt?: string;
  isActive: boolean;
}

// ── Update payload for a single override ─────────────────────────────────────

export interface SetLimitOverridePayload {
  metric: string;
  temporary_limit: number; // snake_case to match backend
  reason?: string;
  expires_at?: string;
}

// ── Legacy shapes kept for compatibility with existing hook callers ────────────

export interface NotifyAccountUsage {
  metric: string;
  label: string;
  used: number;
  limit: number;
  percentage: number;
  period: string;
}

/** Flat account shape used in the UI accounts table — derived from NotifyUser */
export interface NotifyAccount {
  accountId: string;
  userId: string;
  userEmail: string;
  firstName?: string;
  lastName?: string;
  orgId?: string;
  orgName?: string;
  plan: PlanName;
  billingCycle: BillingCycle;
  status: "active" | "suspended" | "trialing" | "cancelled";
  usage: NotifyAccountUsage[];
  createdAt: string;
  lastActiveAt?: string;
}

export interface AccountSubscription {
  accountId: string;
  planId: string;
  plan: PlanName;
  billingCycle: BillingCycle;
  status: string;
  startDate: string;
  nextBillingDate?: string;
  cancelledAt?: string;
  usage: NotifyAccountUsage[];
}

export interface UpdateSubscriptionPayload {
  planId?: string;
  plan?: PlanName;
  billingCycle?: BillingCycle;
  status?: "active" | "suspended" | "cancelled";
}

export interface AccountLimitsResponse {
  accountId: string;
  overrides: AccountLimitOverride[];
}

export interface UpdateLimitsPayload {
  overrides: { metric: string; value: number }[];
}

// ── Plan create/update payloads (not supported by backend admin API; kept for UI) ─

export interface CreatePlanPayload {
  name: string;
  displayName: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  limits: Omit<PlanLimit, "label">[];
  features?: string[];
}

export interface UpdatePlanPayload {
  displayName?: string;
  description?: string;
  priceMonthly?: number;
  priceYearly?: number;
  isActive?: boolean;
  limits?: Omit<PlanLimit, "label">[];
  features?: string[];
}

// ── List response wrappers ────────────────────────────────────────────────────

export interface NotifyPlansResponse {
  plans: NotifyPlan[];
  total: number;
}

export interface NotifyAccountsResponse {
  accounts: NotifyAccount[];
  total: number;
  page: number;
  pages: number;
}
