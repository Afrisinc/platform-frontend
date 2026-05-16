import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import {
  fetchProducts,
  fetchPublicProducts,
  fetchAllUsers,
  resolveRoleId,
  fetchRoleData,
  type BackendSidebarItem,
} from "@/lib/platformApi";

// ── Role Types ───────────────────────────────────────────────────────────────
export type ControlRole =
  | "super_admin"
  | "ops_manager"
  | "finance_admin"
  | "product_manager"
  | "support_lead"
  | "support_agent"
  | "technical_agent"
  | "analyst";

export const ROLE_LABELS: Record<ControlRole, string> = {
  super_admin: "Super Admin",
  ops_manager: "Operations Manager",
  finance_admin: "Finance / Billing Admin",
  product_manager: "Product Manager",
  support_lead: "Support Lead",
  support_agent: "Support Agent",
  technical_agent: "Technical Agent",
  analyst: "Analyst / Viewer",
};

/** Roles that bypass product-level access checks — they see every product automatically. */
export const PLATFORM_WIDE_ROLES: ControlRole[] = ["super_admin", "ops_manager"];

// ── Permission Keys ──────────────────────────────────────────────────────────
export type Permission =
  | "manage_users"
  | "view_users"
  | "create_products"
  | "manage_products"
  | "view_products"
  | "assign_users"
  | "view_all_products"
  | "configure_product"
  | "view_customers"
  | "edit_customers"
  | "view_tickets"
  | "manage_tickets"
  | "respond_tickets"
  | "escalate_tickets"
  | "access_api_keys"
  | "view_reports"
  | "view_billing"
  | "manage_billing"
  | "view_audit"
  | "view_logs"
  | "export_data"
  | "manage_roles";

/** Fallback permission matrix used when the backend is unavailable. */
export const ROLE_PERMISSIONS: Record<ControlRole, Permission[]> = {
  super_admin: [
    "manage_users",
    "view_users",
    "create_products",
    "manage_products",
    "view_products",
    "assign_users",
    "view_all_products",
    "configure_product",
    "view_customers",
    "edit_customers",
    "view_tickets",
    "manage_tickets",
    "respond_tickets",
    "escalate_tickets",
    "access_api_keys",
    "view_reports",
    "view_billing",
    "manage_billing",
    "view_audit",
    "view_logs",
    "export_data",
    "manage_roles",
  ],
  ops_manager: [
    "manage_users",
    "view_users",
    "assign_users",
    "view_all_products",
    "view_products",
    "configure_product",
    "view_customers",
    "edit_customers",
    "view_tickets",
    "manage_tickets",
    "respond_tickets",
    "escalate_tickets",
    "view_reports",
    "view_audit",
    "export_data",
  ],
  finance_admin: ["view_billing", "manage_billing", "view_reports", "export_data"],
  product_manager: [
    "create_products",
    "manage_products",
    "view_products",
    "view_all_products",
    "configure_product",
    "assign_users",
    "view_users",
    "view_customers",
    "edit_customers",
    "view_tickets",
    "manage_tickets",
    "respond_tickets",
    "access_api_keys",
    "view_reports",
    "export_data",
  ],
  support_lead: [
    "manage_users",
    "view_users",
    "assign_users",
    "view_products",
    "view_all_products",
    "view_customers",
    "edit_customers",
    "view_tickets",
    "manage_tickets",
    "respond_tickets",
    "escalate_tickets",
    "view_reports",
    "export_data",
  ],
  support_agent: [
    "view_customers",
    "edit_customers",
    "view_tickets",
    "manage_tickets",
    "respond_tickets",
    "escalate_tickets",
    "view_products",
  ],
  technical_agent: [
    "view_customers",
    "view_tickets",
    "manage_tickets",
    "respond_tickets",
    "escalate_tickets",
    "access_api_keys",
    "configure_product",
    "view_products",
    "view_logs",
  ],
  analyst: [
    "view_customers",
    "view_tickets",
    "view_reports",
    "export_data",
    "view_audit",
    "view_logs",
    "view_products",
  ],
};

// ── Data Interfaces ──────────────────────────────────────────────────────────
export interface ControlUser {
  id: string;
  name: string;
  email: string;
  role: ControlRole;
  productAccess: string[];
  avatar: string;
  /** JWT from the real backend — present only when logged in via the live API. */
  token?: string;
  /** Backend role UUID — stored after SSO exchange to skip the name-based role resolution fetch. */
  role_id?: string;
}

export interface ControlProduct {
  id: string;
  name: string;
  code: string;
  description: string;
  status: "Active" | "Inactive";
  supportEmail: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: ControlRole;
  productAccess: string[];
  status: "Active" | "Inactive" | "Locked";
  lastLogin: string;
  joinedAt: string;
  avatar: string;
}

export type CustomerStatus = "Active" | "Suspended" | "Inactive";

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  status: CustomerStatus;
  products: string[];
  createdAt: string;
  lastActivity: string;
  apiUsage?: number;
}

export type TicketStatus =
  | "Open"
  | "In Progress"
  | "Waiting on Customer"
  | "Escalated"
  | "Resolved";

export type TicketPriority = "Low" | "Medium" | "High" | "Critical";

export interface SupportTicket {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  productId: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  channel: "email" | "form" | "manual";
  tags?: string[];
}

export type AuditEntityType =
  | "user"
  | "product"
  | "ticket"
  | "customer"
  | "api_key"
  | "billing"
  | "role"
  | "session";

export interface AuditEvent {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: AuditEntityType;
  entityId: string;
  description: string;
  productId?: string;
  timestamp: string;
  ip?: string;
}

// ── Session helpers ───────────────────────────────────────────────────────────
export const SESSION_KEY = "ac_session";

export function getStoredUser(): ControlUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw) as ControlUser;
  } catch {}
  return null;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ── Context Shape ────────────────────────────────────────────────────────────
interface PlatformContextType {
  currentUser: ControlUser;
  can: (permission: Permission) => boolean;
  hasProductAccess: (productId: string) => boolean;

  /** Product list — seeded from backend on mount, falls back to INITIAL_PRODUCTS. */
  products: ControlProduct[];
  addProduct: (product: ControlProduct) => void;

  /** Team members — seeded from backend on mount, falls back to TEAM_MEMBERS seed. */
  teamMembers: TeamMember[];

  customers: Customer[];
  tickets: SupportTicket[];
  auditLog: AuditEvent[];

  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  activePage: string;
  setActivePage: (page: string) => void;
  activeProductId: string;
  setActiveProductId: (id: string) => void;
  activeProductTab: string;
  setActiveProductTab: (tab: string) => void;

  /**
   * Sidebar items fetched from the backend for the current user's role.
   * null = backend unavailable, fall back to the static NAV_ITEMS config.
   * Replaced silently in the background — no loading indicator shown.
   */
  backendSidebarItems: BackendSidebarItem[] | null;
}

// ── Seed Data ────────────────────────────────────────────────────────────────

const INITIAL_PRODUCTS: ControlProduct[] = [
  {
    id: "notify",
    name: "Notify",
    code: "NOTIFY",
    description: "Multichannel notification API — email, SMS, and push in one integration.",
    status: "Active",
    supportEmail: "support-notify@afrisinc.com",
    createdAt: "2024-01-15",
  },
  {
    id: "crm",
    name: "CRM",
    code: "CRM",
    description: "Customer relationship management — contacts, pipelines, and deal tracking.",
    status: "Active",
    supportEmail: "support-crm@afrisinc.com",
    createdAt: "2024-03-01",
  },
  {
    id: "payments",
    name: "Payments",
    code: "PAY",
    description: "Payment processing — invoices, subscriptions, and payout reconciliation.",
    status: "Active",
    supportEmail: "support-payments@afrisinc.com",
    createdAt: "2024-06-01",
  },
  {
    id: "analytics",
    name: "Analytics",
    code: "ANA",
    description: "Business intelligence dashboards, custom reports, and data export pipelines.",
    status: "Inactive",
    supportEmail: "support-analytics@afrisinc.com",
    createdAt: "2025-01-10",
  },
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "1",
    name: "Kofi Mensah",
    email: "kofi@afrisinc.com",
    role: "super_admin",
    productAccess: ["notify", "crm", "payments", "analytics"],
    status: "Active",
    lastLogin: "2 min ago",
    joinedAt: "2024-01-01",
    avatar: "KM",
  },
  {
    id: "2",
    name: "Ama Owusu",
    email: "ama@afrisinc.com",
    role: "ops_manager",
    productAccess: ["notify", "crm", "payments", "analytics"],
    status: "Active",
    lastLogin: "1 hour ago",
    joinedAt: "2024-01-10",
    avatar: "AO",
  },
  {
    id: "3",
    name: "James Quaye",
    email: "james@afrisinc.com",
    role: "product_manager",
    productAccess: ["notify", "crm"],
    status: "Active",
    lastLogin: "3 hours ago",
    joinedAt: "2024-02-01",
    avatar: "JQ",
  },
  {
    id: "4",
    name: "Abena Boateng",
    email: "abena@afrisinc.com",
    role: "support_lead",
    productAccess: ["notify", "payments"],
    status: "Active",
    lastLogin: "2 days ago",
    joinedAt: "2024-02-20",
    avatar: "AB",
  },
  {
    id: "5",
    name: "Fatou Diallo",
    email: "fatou@afrisinc.com",
    role: "support_agent",
    productAccess: ["notify", "crm"],
    status: "Active",
    lastLogin: "30 min ago",
    joinedAt: "2024-03-15",
    avatar: "FD",
  },
  {
    id: "6",
    name: "Kwame Asante",
    email: "kwame@afrisinc.com",
    role: "technical_agent",
    productAccess: ["notify"],
    status: "Active",
    lastLogin: "5 hours ago",
    joinedAt: "2024-04-01",
    avatar: "KA",
  },
  {
    id: "7",
    name: "Nadia Osei",
    email: "nadia@afrisinc.com",
    role: "analyst",
    productAccess: ["analytics", "notify"],
    status: "Active",
    lastLogin: "1 day ago",
    joinedAt: "2024-05-01",
    avatar: "NO",
  },
  {
    id: "8",
    name: "Yaw Darko",
    email: "yaw@afrisinc.com",
    role: "finance_admin",
    productAccess: ["payments"],
    status: "Inactive",
    lastLogin: "1 week ago",
    joinedAt: "2024-06-01",
    avatar: "YD",
  },
];

const CUSTOMERS: Customer[] = [
  {
    id: "c1",
    name: "Akosua Mensah",
    email: "akosua@techcorp.gh",
    company: "TechCorp Ghana",
    status: "Active",
    products: ["notify", "crm"],
    createdAt: "2024-02-10",
    lastActivity: "2 hours ago",
    apiUsage: 14320,
  },
  {
    id: "c2",
    name: "Ibrahim Sule",
    email: "ibrahim@tradex.ng",
    company: "TradeX Nigeria",
    status: "Active",
    products: ["notify", "crm", "payments"],
    createdAt: "2024-03-05",
    lastActivity: "1 day ago",
    apiUsage: 8920,
  },
  {
    id: "c3",
    name: "Esi Darko",
    email: "esi@finpay.gh",
    company: "FinPay Solutions",
    status: "Active",
    products: ["notify", "payments"],
    createdAt: "2024-04-20",
    lastActivity: "4 hours ago",
    apiUsage: 22100,
  },
  {
    id: "c4",
    name: "Chidi Okeke",
    email: "chidi@logistech.ng",
    company: "LogisTech",
    status: "Suspended",
    products: ["notify"],
    createdAt: "2024-01-30",
    lastActivity: "3 weeks ago",
    apiUsage: 0,
  },
  {
    id: "c5",
    name: "Aisha Kamara",
    email: "aisha@edufirst.sl",
    company: "EduFirst Sierra Leone",
    status: "Active",
    products: ["notify"],
    createdAt: "2024-05-12",
    lastActivity: "6 hours ago",
    apiUsage: 5650,
  },
  {
    id: "c6",
    name: "Kofi Acheampong",
    email: "kofi@buildr.gh",
    company: "Buildr Africa",
    status: "Active",
    products: ["notify", "crm"],
    createdAt: "2024-06-01",
    lastActivity: "12 hours ago",
    apiUsage: 3200,
  },
  {
    id: "c7",
    name: "Zainab Conteh",
    email: "zainab@healthlink.sl",
    company: "HealthLink SL",
    status: "Inactive",
    products: ["notify"],
    createdAt: "2024-07-15",
    lastActivity: "2 months ago",
    apiUsage: 120,
  },
  {
    id: "c8",
    name: "Emmanuel Osei",
    email: "e.osei@paystack.ng",
    company: "PayStack Partners",
    status: "Active",
    products: ["notify", "crm", "payments"],
    createdAt: "2024-08-01",
    lastActivity: "30 min ago",
    apiUsage: 31400,
  },
  {
    id: "c9",
    name: "Seun Adesanya",
    email: "seun@mediahouse.ng",
    company: "MediaHouse Nigeria",
    status: "Active",
    products: ["notify", "crm", "analytics"],
    createdAt: "2024-09-10",
    lastActivity: "1 hour ago",
    apiUsage: 18740,
  },
  {
    id: "c10",
    name: "Abena Frimpong",
    email: "abena@greenpay.gh",
    company: "GreenPay Ghana",
    status: "Active",
    products: ["payments", "notify"],
    createdAt: "2024-09-25",
    lastActivity: "3 hours ago",
    apiUsage: 41200,
  },
  {
    id: "c11",
    name: "Moussa Touré",
    email: "moussa@sn-logistics.sn",
    company: "Senegal Logistics",
    status: "Active",
    products: ["notify"],
    createdAt: "2024-10-14",
    lastActivity: "2 days ago",
    apiUsage: 3890,
  },
  {
    id: "c12",
    name: "Femi Adeyemi",
    email: "femi@devstudios.ng",
    company: "Dev Studios Lagos",
    status: "Active",
    products: ["notify", "crm"],
    createdAt: "2024-11-02",
    lastActivity: "20 min ago",
    apiUsage: 9110,
  },
  {
    id: "c13",
    name: "Grace Mwangi",
    email: "grace@kenyaedtech.ke",
    company: "Kenya EdTech",
    status: "Active",
    products: ["notify", "analytics"],
    createdAt: "2024-11-18",
    lastActivity: "5 hours ago",
    apiUsage: 6780,
  },
  {
    id: "c14",
    name: "Alain Kaboré",
    email: "alain@ouagacommerce.bf",
    company: "Ouaga Commerce",
    status: "Active",
    products: ["crm", "payments"],
    createdAt: "2024-12-05",
    lastActivity: "1 day ago",
    apiUsage: 2450,
  },
  {
    id: "c15",
    name: "Tunde Ogunleye",
    email: "tunde@afribank.ng",
    company: "AfriBank",
    status: "Active",
    products: ["notify", "crm", "payments", "analytics"],
    createdAt: "2025-01-12",
    lastActivity: "10 min ago",
    apiUsage: 67900,
  },
];

const TICKETS: SupportTicket[] = [
  // ── Notify ───────────────────────────────────────────────────────────────────
  {
    id: "TKT-001",
    customerId: "c1",
    customerName: "Akosua Mensah",
    customerEmail: "akosua@techcorp.gh",
    productId: "notify",
    subject: "Emails not delivering to Gmail addresses",
    status: "Open",
    priority: "High",
    assignedTo: null,
    createdAt: "2025-04-25T08:12:00Z",
    updatedAt: "2025-04-25T08:12:00Z",
    channel: "email",
    tags: ["delivery", "gmail"],
  },
  {
    id: "TKT-002",
    customerId: "c2",
    customerName: "Ibrahim Sule",
    customerEmail: "ibrahim@tradex.ng",
    productId: "notify",
    subject: "SMS delivery delays to Nigerian numbers",
    status: "In Progress",
    priority: "Critical",
    assignedTo: "Fatou Diallo",
    createdAt: "2025-04-24T14:30:00Z",
    updatedAt: "2025-04-25T07:00:00Z",
    channel: "form",
    tags: ["sms", "nigeria"],
  },
  {
    id: "TKT-003",
    customerId: "c3",
    customerName: "Esi Darko",
    customerEmail: "esi@finpay.gh",
    productId: "notify",
    subject: "Webhook not triggering on delivery events",
    status: "Escalated",
    priority: "High",
    assignedTo: "Kwame Asante",
    createdAt: "2025-04-23T10:00:00Z",
    updatedAt: "2025-04-24T15:30:00Z",
    channel: "email",
    tags: ["webhook"],
  },
  {
    id: "TKT-004",
    customerId: "c5",
    customerName: "Aisha Kamara",
    customerEmail: "aisha@edufirst.sl",
    productId: "notify",
    subject: "Need to increase rate limit for SMS channel",
    status: "Waiting on Customer",
    priority: "Medium",
    assignedTo: "Fatou Diallo",
    createdAt: "2025-04-22T09:00:00Z",
    updatedAt: "2025-04-24T10:00:00Z",
    channel: "manual",
    tags: ["rate-limit"],
  },
  {
    id: "TKT-005",
    customerId: "c6",
    customerName: "Kofi Acheampong",
    customerEmail: "kofi@buildr.gh",
    productId: "notify",
    subject: "Template rendering broken — variables not replaced",
    status: "Open",
    priority: "Medium",
    assignedTo: null,
    createdAt: "2025-04-25T06:45:00Z",
    updatedAt: "2025-04-25T06:45:00Z",
    channel: "email",
  },
  {
    id: "TKT-006",
    customerId: "c8",
    customerName: "Emmanuel Osei",
    customerEmail: "e.osei@paystack.ng",
    productId: "notify",
    subject: "Request for dedicated sending domain",
    status: "Resolved",
    priority: "Low",
    assignedTo: "Abena Boateng",
    createdAt: "2025-04-20T11:00:00Z",
    updatedAt: "2025-04-22T14:00:00Z",
    channel: "email",
  },
  {
    id: "TKT-007",
    customerId: "c1",
    customerName: "Akosua Mensah",
    customerEmail: "akosua@techcorp.gh",
    productId: "notify",
    subject: "API key rotation — need guidance",
    status: "Resolved",
    priority: "Low",
    assignedTo: "Kwame Asante",
    createdAt: "2025-04-18T09:30:00Z",
    updatedAt: "2025-04-19T11:00:00Z",
    channel: "form",
  },
  {
    id: "TKT-014",
    customerId: "c9",
    customerName: "Seun Adesanya",
    customerEmail: "seun@mediahouse.ng",
    productId: "notify",
    subject: "Push notifications not showing on iOS 17+",
    status: "Open",
    priority: "High",
    assignedTo: "Kwame Asante",
    createdAt: "2025-04-25T10:20:00Z",
    updatedAt: "2025-04-25T10:20:00Z",
    channel: "form",
    tags: ["push", "ios"],
  },
  {
    id: "TKT-015",
    customerId: "c12",
    customerName: "Femi Adeyemi",
    customerEmail: "femi@devstudios.ng",
    productId: "notify",
    subject: "Sandbox test messages appearing in production",
    status: "In Progress",
    priority: "Critical",
    assignedTo: "Kwame Asante",
    createdAt: "2025-04-24T08:00:00Z",
    updatedAt: "2025-04-25T09:00:00Z",
    channel: "email",
    tags: ["sandbox", "production"],
  },
  {
    id: "TKT-016",
    customerId: "c15",
    customerName: "Tunde Ogunleye",
    customerEmail: "tunde@afribank.ng",
    productId: "notify",
    subject: "Bulk email job queued but never executed",
    status: "Escalated",
    priority: "Critical",
    assignedTo: "Abena Boateng",
    createdAt: "2025-04-24T16:45:00Z",
    updatedAt: "2025-04-25T08:30:00Z",
    channel: "email",
    tags: ["bulk", "queue"],
  },
  // ── CRM ──────────────────────────────────────────────────────────────────────
  {
    id: "TKT-008",
    customerId: "c2",
    customerName: "Ibrahim Sule",
    customerEmail: "ibrahim@tradex.ng",
    productId: "crm",
    subject: "Contact sync failing — duplicates on import from CSV",
    status: "Open",
    priority: "Medium",
    assignedTo: "Fatou Diallo",
    createdAt: "2025-04-25T09:00:00Z",
    updatedAt: "2025-04-25T09:00:00Z",
    channel: "email",
    tags: ["import", "duplicates"],
  },
  {
    id: "TKT-009",
    customerId: "c6",
    customerName: "Kofi Acheampong",
    customerEmail: "kofi@buildr.gh",
    productId: "crm",
    subject: "Pipeline stage automation not firing on deal close",
    status: "In Progress",
    priority: "High",
    assignedTo: "James Quaye",
    createdAt: "2025-04-24T11:30:00Z",
    updatedAt: "2025-04-25T08:00:00Z",
    channel: "form",
    tags: ["automation"],
  },
  {
    id: "TKT-010",
    customerId: "c1",
    customerName: "Akosua Mensah",
    customerEmail: "akosua@techcorp.gh",
    productId: "crm",
    subject: "Custom field values not saving on contact profile",
    status: "Resolved",
    priority: "Low",
    assignedTo: "James Quaye",
    createdAt: "2025-04-18T14:00:00Z",
    updatedAt: "2025-04-20T09:00:00Z",
    channel: "manual",
  },
  {
    id: "TKT-017",
    customerId: "c12",
    customerName: "Femi Adeyemi",
    customerEmail: "femi@devstudios.ng",
    productId: "crm",
    subject: "Deal report export timing out for date ranges > 90 days",
    status: "Open",
    priority: "Medium",
    assignedTo: null,
    createdAt: "2025-04-25T07:00:00Z",
    updatedAt: "2025-04-25T07:00:00Z",
    channel: "form",
  },
  {
    id: "TKT-018",
    customerId: "c9",
    customerName: "Seun Adesanya",
    customerEmail: "seun@mediahouse.ng",
    productId: "crm",
    subject: "Webhook event not firing on contact status change",
    status: "Waiting on Customer",
    priority: "Low",
    assignedTo: "James Quaye",
    createdAt: "2025-04-23T13:00:00Z",
    updatedAt: "2025-04-24T16:00:00Z",
    channel: "email",
  },
  // ── Payments ─────────────────────────────────────────────────────────────────
  {
    id: "TKT-011",
    customerId: "c3",
    customerName: "Esi Darko",
    customerEmail: "esi@finpay.gh",
    productId: "payments",
    subject: "Payout webhook not triggering on settlement events",
    status: "Escalated",
    priority: "Critical",
    assignedTo: "Abena Boateng",
    createdAt: "2025-04-24T16:00:00Z",
    updatedAt: "2025-04-25T07:30:00Z",
    channel: "email",
    tags: ["webhook", "payout"],
  },
  {
    id: "TKT-012",
    customerId: "c8",
    customerName: "Emmanuel Osei",
    customerEmail: "e.osei@paystack.ng",
    productId: "payments",
    subject: "Invoice PDF generation missing company logo",
    status: "Open",
    priority: "Low",
    assignedTo: null,
    createdAt: "2025-04-25T07:15:00Z",
    updatedAt: "2025-04-25T07:15:00Z",
    channel: "form",
  },
  {
    id: "TKT-013",
    customerId: "c2",
    customerName: "Ibrahim Sule",
    customerEmail: "ibrahim@tradex.ng",
    productId: "payments",
    subject: "Failed reconciliation on March batch — 3 mismatches",
    status: "In Progress",
    priority: "High",
    assignedTo: "Abena Boateng",
    createdAt: "2025-04-23T08:00:00Z",
    updatedAt: "2025-04-24T14:00:00Z",
    channel: "email",
    tags: ["reconciliation"],
  },
  {
    id: "TKT-019",
    customerId: "c10",
    customerName: "Abena Frimpong",
    customerEmail: "abena@greenpay.gh",
    productId: "payments",
    subject: "Subscription renewal charging incorrect amount (USD vs GHS)",
    status: "Open",
    priority: "Critical",
    assignedTo: "Abena Boateng",
    createdAt: "2025-04-25T11:00:00Z",
    updatedAt: "2025-04-25T11:00:00Z",
    channel: "email",
    tags: ["billing", "currency"],
  },
  {
    id: "TKT-020",
    customerId: "c15",
    customerName: "Tunde Ogunleye",
    customerEmail: "tunde@afribank.ng",
    productId: "payments",
    subject: "Bulk payout API returning 504 on batches > 500 records",
    status: "Escalated",
    priority: "High",
    assignedTo: "Kwame Asante",
    createdAt: "2025-04-24T09:30:00Z",
    updatedAt: "2025-04-25T08:00:00Z",
    channel: "form",
    tags: ["api", "timeout"],
  },
];

const AUDIT_LOG: AuditEvent[] = [
  // ── Today (Apr 25) ───────────────────────────────────────────────────────────
  {
    id: "a1",
    userId: "1",
    userName: "Kofi Mensah",
    action: "User Login",
    entityType: "session",
    entityId: "1",
    description: "Successful login from 196.0.0.1",
    timestamp: "2025-04-25T08:00:00Z",
    ip: "196.0.0.1",
  },
  {
    id: "a2",
    userId: "1",
    userName: "Kofi Mensah",
    action: "User Created",
    entityType: "user",
    entityId: "8",
    description: "Created user account for Yaw Darko (Finance Admin)",
    timestamp: "2025-04-25T08:30:00Z",
    ip: "196.0.0.1",
  },
  {
    id: "a3",
    userId: "1",
    userName: "Kofi Mensah",
    action: "Role Assigned",
    entityType: "role",
    entityId: "8",
    description: "Assigned Finance Admin role to Yaw Darko",
    timestamp: "2025-04-25T08:31:00Z",
    ip: "196.0.0.1",
  },
  {
    id: "a4",
    userId: "5",
    userName: "Fatou Diallo",
    action: "Ticket Updated",
    entityType: "ticket",
    entityId: "TKT-002",
    description: "TKT-002 status → In Progress (SMS delivery delays, TradeX Nigeria)",
    productId: "notify",
    timestamp: "2025-04-25T07:00:00Z",
    ip: "196.0.0.5",
  },
  {
    id: "a5",
    userId: "4",
    userName: "Abena Boateng",
    action: "Ticket Escalated",
    entityType: "ticket",
    entityId: "TKT-016",
    description: "TKT-016 escalated — AfriBank bulk email job stalled",
    productId: "notify",
    timestamp: "2025-04-25T08:30:00Z",
  },
  {
    id: "a6",
    userId: "4",
    userName: "Abena Boateng",
    action: "Ticket Escalated",
    entityType: "ticket",
    entityId: "TKT-019",
    description: "TKT-019 critical — GreenPay billing currency mismatch",
    productId: "payments",
    timestamp: "2025-04-25T11:05:00Z",
  },
  {
    id: "a7",
    userId: "6",
    userName: "Kwame Asante",
    action: "Ticket Assigned",
    entityType: "ticket",
    entityId: "TKT-014",
    description: "TKT-014 assigned to Kwame Asante — MediaHouse iOS push issue",
    productId: "notify",
    timestamp: "2025-04-25T10:25:00Z",
    ip: "196.0.0.6",
  },
  {
    id: "a8",
    userId: "3",
    userName: "James Quaye",
    action: "Ticket Updated",
    entityType: "ticket",
    entityId: "TKT-009",
    description: "TKT-009 pipeline automation → In Progress",
    productId: "crm",
    timestamp: "2025-04-25T08:00:00Z",
  },
  // ── Yesterday (Apr 24) ───────────────────────────────────────────────────────
  {
    id: "a9",
    userId: "2",
    userName: "Ama Owusu",
    action: "User Assigned",
    entityType: "user",
    entityId: "5",
    description: "Assigned Fatou Diallo to Notify + CRM products",
    productId: "crm",
    timestamp: "2025-04-24T14:00:00Z",
    ip: "196.0.0.2",
  },
  {
    id: "a10",
    userId: "4",
    userName: "Abena Boateng",
    action: "Ticket Escalated",
    entityType: "ticket",
    entityId: "TKT-003",
    description: "TKT-003 escalated to Technical Agent — Kwame Asante",
    productId: "notify",
    timestamp: "2025-04-24T12:00:00Z",
  },
  {
    id: "a11",
    userId: "6",
    userName: "Kwame Asante",
    action: "API Key Generated",
    entityType: "api_key",
    entityId: "ak_001",
    description: "Production API key generated for TechCorp Ghana",
    timestamp: "2025-04-24T10:15:00Z",
    ip: "196.0.0.6",
  },
  {
    id: "a12",
    userId: "6",
    userName: "Kwame Asante",
    action: "API Key Rotated",
    entityType: "api_key",
    entityId: "ak_002",
    description: "API key rotated for FinPay Solutions (expiry policy)",
    timestamp: "2025-04-24T11:00:00Z",
    ip: "196.0.0.6",
  },
  {
    id: "a13",
    userId: "1",
    userName: "Kofi Mensah",
    action: "Product Configured",
    entityType: "product",
    entityId: "payments",
    description: "Enabled sandbox mode for Payments product",
    productId: "payments",
    timestamp: "2025-04-24T09:00:00Z",
    ip: "196.0.0.1",
  },
  // ── Apr 22–23 ────────────────────────────────────────────────────────────────
  {
    id: "a14",
    userId: "1",
    userName: "Kofi Mensah",
    action: "Role Created",
    entityType: "role",
    entityId: "role_analyst",
    description: "Created new role: Analyst / Viewer",
    timestamp: "2025-04-23T15:00:00Z",
    ip: "196.0.0.1",
  },
  {
    id: "a15",
    userId: "1",
    userName: "Kofi Mensah",
    action: "Role Changed",
    entityType: "role",
    entityId: "7",
    description: "Nadia Osei role updated → Analyst / Viewer",
    timestamp: "2025-04-22T16:00:00Z",
    ip: "196.0.0.1",
  },
  {
    id: "a16",
    userId: "4",
    userName: "Abena Boateng",
    action: "Ticket Resolved",
    entityType: "ticket",
    entityId: "TKT-006",
    description: "TKT-006 resolved — dedicated sending domain configured for PayStack",
    productId: "notify",
    timestamp: "2025-04-22T14:00:00Z",
  },
  {
    id: "a17",
    userId: "3",
    userName: "James Quaye",
    action: "Product Configured",
    entityType: "product",
    entityId: "notify",
    description: "Updated Notify support email → support-notify@afrisinc.com",
    productId: "notify",
    timestamp: "2025-04-22T11:30:00Z",
  },
  {
    id: "a18",
    userId: "2",
    userName: "Ama Owusu",
    action: "User Assigned",
    entityType: "user",
    entityId: "4",
    description: "Assigned Abena Boateng to Payments product",
    productId: "payments",
    timestamp: "2025-04-22T10:30:00Z",
    ip: "196.0.0.2",
  },
  // ── Apr 20–21 ────────────────────────────────────────────────────────────────
  {
    id: "a19",
    userId: "1",
    userName: "Kofi Mensah",
    action: "Product Created",
    entityType: "product",
    entityId: "analytics",
    description: "Created product: Analytics (BETA)",
    timestamp: "2025-04-21T11:00:00Z",
    ip: "196.0.0.1",
  },
  {
    id: "a20",
    userId: "1",
    userName: "Kofi Mensah",
    action: "Product Created",
    entityType: "product",
    entityId: "crm",
    description: "Created product: CRM",
    timestamp: "2025-04-20T10:00:00Z",
    ip: "196.0.0.1",
  },
  {
    id: "a21",
    userId: "1",
    userName: "Kofi Mensah",
    action: "User Assigned",
    entityType: "user",
    entityId: "3",
    description: "Assigned James Quaye to CRM + Notify as Product Manager",
    productId: "crm",
    timestamp: "2025-04-20T10:15:00Z",
    ip: "196.0.0.1",
  },
  {
    id: "a22",
    userId: "6",
    userName: "Kwame Asante",
    action: "Ticket Resolved",
    entityType: "ticket",
    entityId: "TKT-007",
    description: "TKT-007 resolved — API key rotation guide provided to TechCorp Ghana",
    productId: "notify",
    timestamp: "2025-04-19T11:00:00Z",
  },
  // ── Billing ───────────────────────────────────────────────────────────────────
  {
    id: "a23",
    userId: "8",
    userName: "Yaw Darko",
    action: "Invoice Generated",
    entityType: "billing",
    entityId: "inv_042",
    description: "April invoice generated — TradeX Nigeria ($1,240)",
    productId: "payments",
    timestamp: "2025-04-20T09:00:00Z",
  },
  {
    id: "a24",
    userId: "8",
    userName: "Yaw Darko",
    action: "Payment Received",
    entityType: "billing",
    entityId: "pay_091",
    description: "Payment confirmed — FinPay Solutions ($3,600)",
    productId: "payments",
    timestamp: "2025-04-21T14:00:00Z",
  },
];

// ── Context & Provider ───────────────────────────────────────────────────────
const PlatformContext = createContext<PlatformContextType | null>(null);

const defaultUser: ControlUser = {
  id: "1",
  name: "Kofi Mensah",
  email: "kofi@afrisinc.com",
  role: "super_admin",
  productAccess: ["notify", "crm", "payments", "analytics"],
  avatar: "KM",
};

export function PlatformProvider({ children }: { children: ReactNode }) {
  // Resolve logged-in user from localStorage (written by LoginPage)
  const [currentUser] = useState<ControlUser>(() => getStoredUser() ?? defaultUser);

  // Products — seeded from backend on mount, mutated by addProduct (Super Admin)
  const [products, setProducts] = useState<ControlProduct[]>(INITIAL_PRODUCTS);

  // Team members — seeded from backend on mount, falls back to TEAM_MEMBERS seed
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(TEAM_MEMBERS);

  // Permissions loaded from backend for the current role (null = use ROLE_PERMISSIONS fallback)
  const [dynamicPermissions, setDynamicPermissions] = useState<Permission[] | null>(null);

  // Sidebar items from backend for the current role (null = use static NAV_ITEMS fallback)
  const [backendSidebarItems, setBackendSidebarItems] = useState<BackendSidebarItem[] | null>(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [activeProductId, setActiveProductId] = useState("notify");
  const [activeProductTab, setActiveProductTab] = useState("overview");

  // ── Backend data loading ──────────────────────────────────────────────────
  useEffect(() => {
    const token = currentUser.token;
    if (!token) return; // Seed/demo auth — skip backend fetch

    async function loadBackendData() {
      // ── 1. Products ─────────────────────────────────────────────────────
      try {
        const backendProducts = await fetchProducts(token!);
        if (backendProducts.length > 0) {
          setProducts(backendProducts);
        }
      } catch {
        // Backend unavailable — keep INITIAL_PRODUCTS (already in state)
        // Also try public products as a lighter fallback (no auth required)
        try {
          const publicProds = await fetchPublicProducts();
          if (publicProds.length > 0) setProducts(publicProds);
        } catch {
          // Both failed — INITIAL_PRODUCTS seed stays
        }
      }

      // ── 2. Team members ─────────────────────────────────────────────────
      try {
        const backendUsers = await fetchAllUsers(token!);
        if (backendUsers.length > 0) {
          setTeamMembers(backendUsers);
        }
      } catch {
        // Backend unavailable — TEAM_MEMBERS seed stays
      }

      // ── 3. Role permissions & sidebar items ─────────────────────────────
      try {
        // Use stored role_id from the SSO exchange (fast path) — avoids an extra
        // GET /api/admin/roles round-trip to resolve by name.
        const roleId = currentUser.role_id ?? (await resolveRoleId(token!, currentUser.role));
        if (roleId) {
          try {
            const { permissions, sidebarItems } = await fetchRoleData(token!, roleId);
            if (permissions.length > 0) setDynamicPermissions(permissions);
            if (sidebarItems.length > 0) setBackendSidebarItems(sidebarItems);
          } catch {
            // Fallback to ROLE_PERMISSIONS and Static NAV_ITEMS
          }
        }
      } catch {
        // Role resolution failed — static fallbacks stay
      }
    }

    loadBackendData();
  }, [currentUser.token, currentUser.role]);

  // ── Gate functions ────────────────────────────────────────────────────────

  /**
   * Check if the current user has a given permission.
   * Uses backend-loaded permissions when available, falls back to ROLE_PERMISSIONS.
   */
  const can = useCallback(
    (permission: Permission): boolean => {
      const perms = dynamicPermissions ?? ROLE_PERMISSIONS[currentUser.role];
      return perms.includes(permission);
    },
    [currentUser.role, dynamicPermissions]
  );

  /**
   * Check if the current user has access to a product.
   * PLATFORM_WIDE_ROLES bypass explicit product assignment.
   */
  const hasProductAccess = useCallback(
    (productId: string): boolean =>
      PLATFORM_WIDE_ROLES.includes(currentUser.role) ||
      currentUser.productAccess.includes(productId),
    [currentUser]
  );

  /** Add a new product (Super Admin). Updates local state; caller handles backend persistence. */
  const addProduct = useCallback(
    (product: ControlProduct) => setProducts((prev) => [...prev, product]),
    []
  );

  return (
    <PlatformContext.Provider
      value={{
        currentUser,
        can,
        hasProductAccess,
        products,
        addProduct,
        teamMembers,
        customers: CUSTOMERS,
        tickets: TICKETS,
        auditLog: AUDIT_LOG,
        sidebarCollapsed,
        setSidebarCollapsed,
        activePage,
        setActivePage,
        activeProductId,
        setActiveProductId,
        activeProductTab,
        setActiveProductTab,
        backendSidebarItems,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error("usePlatform must be used within PlatformProvider");
  return ctx;
}
