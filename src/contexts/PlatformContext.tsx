import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import {
  fetchProducts,
  fetchPublicProducts,
  fetchAllUsers,
  resolveRoleId,
  fetchRolePermissions,
  fetchRoleSidebarItems,
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
  super_admin:     "Super Admin",
  ops_manager:     "Operations Manager",
  finance_admin:   "Finance / Billing Admin",
  product_manager: "Product Manager",
  support_lead:    "Support Lead",
  support_agent:   "Support Agent",
  technical_agent: "Technical Agent",
  analyst:         "Analyst / Viewer",
};

/** Roles that bypass product-level access checks — they see every product automatically. */
export const PLATFORM_WIDE_ROLES: ControlRole[] = ["super_admin", "ops_manager"];

// ── Permission Keys ──────────────────────────────────────────────────────────
export type Permission =
  | "manage_users"
  | "create_products"
  | "assign_users"
  | "view_all_products"
  | "configure_product"
  | "view_customers"
  | "edit_customers"
  | "view_tickets"
  | "respond_tickets"
  | "escalate_tickets"
  | "access_api_keys"
  | "view_reports"
  | "view_billing"
  | "view_audit"
  | "export_data";

/** Fallback permission matrix used when the backend is unavailable. */
export const ROLE_PERMISSIONS: Record<ControlRole, Permission[]> = {
  super_admin: [
    "manage_users", "create_products", "assign_users", "view_all_products",
    "configure_product", "view_customers", "edit_customers", "view_tickets",
    "respond_tickets", "escalate_tickets", "access_api_keys", "view_reports",
    "view_billing", "view_audit", "export_data",
  ],
  ops_manager: [
    "assign_users", "view_all_products", "view_customers", "edit_customers",
    "view_tickets", "view_reports", "view_audit", "export_data",
  ],
  finance_admin:   ["view_billing"],
  product_manager: [
    "configure_product", "view_customers", "edit_customers",
    "view_tickets", "view_reports", "export_data",
  ],
  support_lead: [
    "view_customers", "edit_customers", "view_tickets",
    "respond_tickets", "escalate_tickets", "view_reports",
  ],
  support_agent: [
    "view_customers", "edit_customers", "view_tickets",
    "respond_tickets", "escalate_tickets",
  ],
  technical_agent: ["view_customers", "view_tickets", "respond_tickets", "access_api_keys"],
  analyst:         ["view_customers", "view_reports", "view_audit", "export_data"],
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
  | "user" | "product" | "ticket" | "customer"
  | "api_key" | "billing" | "role" | "session";

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
   */
  backendSidebarItems: BackendSidebarItem[] | null;

  /** True while the initial backend data fetch is in progress. */
  isLoadingBackendData: boolean;
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
    id: "1", name: "Kofi Mensah",    email: "kofi@afrisinc.com",   role: "super_admin",
    productAccess: ["notify", "crm", "payments", "analytics"],
    status: "Active",   lastLogin: "2 min ago",   joinedAt: "2024-01-01", avatar: "KM",
  },
  {
    id: "2", name: "Ama Owusu",      email: "ama@afrisinc.com",    role: "ops_manager",
    productAccess: ["notify", "crm", "payments", "analytics"],
    status: "Active",   lastLogin: "1 hour ago",  joinedAt: "2024-01-10", avatar: "AO",
  },
  {
    id: "3", name: "James Quaye",    email: "james@afrisinc.com",  role: "product_manager",
    productAccess: ["notify", "crm"],
    status: "Active",   lastLogin: "3 hours ago", joinedAt: "2024-02-01", avatar: "JQ",
  },
  {
    id: "4", name: "Abena Boateng",  email: "abena@afrisinc.com",  role: "support_lead",
    productAccess: ["notify", "payments"],
    status: "Active",   lastLogin: "2 days ago",  joinedAt: "2024-02-20", avatar: "AB",
  },
  {
    id: "5", name: "Fatou Diallo",   email: "fatou@afrisinc.com",  role: "support_agent",
    productAccess: ["notify", "crm"],
    status: "Active",   lastLogin: "30 min ago",  joinedAt: "2024-03-15", avatar: "FD",
  },
  {
    id: "6", name: "Kwame Asante",   email: "kwame@afrisinc.com",  role: "technical_agent",
    productAccess: ["notify"],
    status: "Active",   lastLogin: "5 hours ago", joinedAt: "2024-04-01", avatar: "KA",
  },
  {
    id: "7", name: "Nadia Osei",     email: "nadia@afrisinc.com",  role: "analyst",
    productAccess: ["analytics", "notify"],
    status: "Active",   lastLogin: "1 day ago",   joinedAt: "2024-05-01", avatar: "NO",
  },
  {
    id: "8", name: "Yaw Darko",      email: "yaw@afrisinc.com",    role: "finance_admin",
    productAccess: ["payments"],
    status: "Inactive", lastLogin: "1 week ago",  joinedAt: "2024-06-01", avatar: "YD",
  },
];

const CUSTOMERS: Customer[] = [
  { id: "c1", name: "Akosua Mensah",   email: "akosua@techcorp.gh",   company: "TechCorp Ghana",       status: "Active",    products: ["notify", "crm"],            createdAt: "2024-02-10", lastActivity: "2 hours ago",  apiUsage: 14320 },
  { id: "c2", name: "Ibrahim Sule",    email: "ibrahim@tradex.ng",    company: "TradeX Nigeria",        status: "Active",    products: ["notify", "crm", "payments"],createdAt: "2024-03-05", lastActivity: "1 day ago",    apiUsage: 8920  },
  { id: "c3", name: "Esi Darko",       email: "esi@finpay.gh",        company: "FinPay Solutions",      status: "Active",    products: ["notify", "payments"],       createdAt: "2024-04-20", lastActivity: "4 hours ago",  apiUsage: 22100 },
  { id: "c4", name: "Chidi Okeke",     email: "chidi@logistech.ng",   company: "LogisTech",             status: "Suspended", products: ["notify"],                   createdAt: "2024-01-30", lastActivity: "3 weeks ago",  apiUsage: 0     },
  { id: "c5", name: "Aisha Kamara",    email: "aisha@edufirst.sl",    company: "EduFirst Sierra Leone", status: "Active",    products: ["notify"],                   createdAt: "2024-05-12", lastActivity: "6 hours ago",  apiUsage: 5650  },
  { id: "c6", name: "Kofi Acheampong", email: "kofi@buildr.gh",       company: "Buildr Africa",         status: "Active",    products: ["notify", "crm"],            createdAt: "2024-06-01", lastActivity: "12 hours ago", apiUsage: 3200  },
  { id: "c7", name: "Zainab Conteh",  email: "zainab@healthlink.sl", company: "HealthLink",            status: "Inactive",  products: ["notify"],                   createdAt: "2024-07-15", lastActivity: "2 months ago", apiUsage: 120   },
  { id: "c8", name: "Emmanuel Osei",  email: "e.osei@paystack.ng",   company: "PayStack Partners",     status: "Active",    products: ["notify", "crm", "payments"],createdAt: "2024-08-01", lastActivity: "30 min ago",   apiUsage: 31400 },
];

const TICKETS: SupportTicket[] = [
  { id: "TKT-001", customerId: "c1", customerName: "Akosua Mensah",   customerEmail: "akosua@techcorp.gh", productId: "notify",   subject: "Emails not delivering to Gmail addresses",             status: "Open",                priority: "High",     assignedTo: null,            createdAt: "2025-04-25T08:12:00Z", updatedAt: "2025-04-25T08:12:00Z", channel: "email",  tags: ["delivery", "gmail"] },
  { id: "TKT-002", customerId: "c2", customerName: "Ibrahim Sule",    customerEmail: "ibrahim@tradex.ng",  productId: "notify",   subject: "SMS delivery delays to Nigerian numbers",              status: "In Progress",         priority: "Critical", assignedTo: "Fatou Diallo",  createdAt: "2025-04-24T14:30:00Z", updatedAt: "2025-04-25T07:00:00Z", channel: "form",   tags: ["sms", "nigeria"] },
  { id: "TKT-003", customerId: "c3", customerName: "Esi Darko",       customerEmail: "esi@finpay.gh",      productId: "notify",   subject: "Webhook not triggering on delivery events",            status: "Escalated",           priority: "High",     assignedTo: "Kwame Asante",  createdAt: "2025-04-23T10:00:00Z", updatedAt: "2025-04-24T15:30:00Z", channel: "email",  tags: ["webhook"] },
  { id: "TKT-004", customerId: "c5", customerName: "Aisha Kamara",    customerEmail: "aisha@edufirst.sl",  productId: "notify",   subject: "Need to increase rate limit for SMS channel",          status: "Waiting on Customer", priority: "Medium",   assignedTo: "Fatou Diallo",  createdAt: "2025-04-22T09:00:00Z", updatedAt: "2025-04-24T10:00:00Z", channel: "manual", tags: ["rate-limit"] },
  { id: "TKT-005", customerId: "c6", customerName: "Kofi Acheampong", customerEmail: "kofi@buildr.gh",     productId: "notify",   subject: "Template rendering broken — variables not replaced",   status: "Open",                priority: "Medium",   assignedTo: null,            createdAt: "2025-04-25T06:45:00Z", updatedAt: "2025-04-25T06:45:00Z", channel: "email" },
  { id: "TKT-006", customerId: "c8", customerName: "Emmanuel Osei",   customerEmail: "e.osei@paystack.ng", productId: "notify",   subject: "Request for dedicated sending domain",                 status: "Resolved",            priority: "Low",      assignedTo: "Abena Boateng", createdAt: "2025-04-20T11:00:00Z", updatedAt: "2025-04-22T14:00:00Z", channel: "email" },
  { id: "TKT-007", customerId: "c1", customerName: "Akosua Mensah",   customerEmail: "akosua@techcorp.gh", productId: "notify",   subject: "API key rotation — need guidance",                     status: "Resolved",            priority: "Low",      assignedTo: "Kwame Asante",  createdAt: "2025-04-18T09:30:00Z", updatedAt: "2025-04-19T11:00:00Z", channel: "form" },
  { id: "TKT-008", customerId: "c2", customerName: "Ibrahim Sule",    customerEmail: "ibrahim@tradex.ng",  productId: "crm",      subject: "Contact sync failing — duplicates on import from CSV",  status: "Open",                priority: "Medium",   assignedTo: "Fatou Diallo",  createdAt: "2025-04-25T09:00:00Z", updatedAt: "2025-04-25T09:00:00Z", channel: "email",  tags: ["import", "duplicates"] },
  { id: "TKT-009", customerId: "c6", customerName: "Kofi Acheampong", customerEmail: "kofi@buildr.gh",     productId: "crm",      subject: "Pipeline stage automation not firing on deal close",   status: "In Progress",         priority: "High",     assignedTo: "James Quaye",   createdAt: "2025-04-24T11:30:00Z", updatedAt: "2025-04-25T08:00:00Z", channel: "form",   tags: ["automation"] },
  { id: "TKT-010", customerId: "c1", customerName: "Akosua Mensah",   customerEmail: "akosua@techcorp.gh", productId: "crm",      subject: "Custom field values not saving on contact profile",    status: "Resolved",            priority: "Low",      assignedTo: "James Quaye",   createdAt: "2025-04-18T14:00:00Z", updatedAt: "2025-04-20T09:00:00Z", channel: "manual" },
  { id: "TKT-011", customerId: "c3", customerName: "Esi Darko",       customerEmail: "esi@finpay.gh",      productId: "payments", subject: "Payout webhook not triggering on settlement events",   status: "Escalated",           priority: "Critical", assignedTo: "Abena Boateng", createdAt: "2025-04-24T16:00:00Z", updatedAt: "2025-04-25T07:30:00Z", channel: "email",  tags: ["webhook", "payout"] },
  { id: "TKT-012", customerId: "c8", customerName: "Emmanuel Osei",   customerEmail: "e.osei@paystack.ng", productId: "payments", subject: "Invoice PDF generation missing company logo",          status: "Open",                priority: "Low",      assignedTo: null,            createdAt: "2025-04-25T07:15:00Z", updatedAt: "2025-04-25T07:15:00Z", channel: "form" },
  { id: "TKT-013", customerId: "c2", customerName: "Ibrahim Sule",    customerEmail: "ibrahim@tradex.ng",  productId: "payments", subject: "Failed reconciliation on March batch — 3 mismatches",  status: "In Progress",         priority: "High",     assignedTo: "Abena Boateng", createdAt: "2025-04-23T08:00:00Z", updatedAt: "2025-04-24T14:00:00Z", channel: "email",  tags: ["reconciliation"] },
];

const AUDIT_LOG: AuditEvent[] = [
  { id: "a1",  userId: "1", userName: "Kofi Mensah",   action: "User Created",       entityType: "user",    entityId: "8",       description: "Created user account for Yaw Darko (Finance Admin)",                        timestamp: "2025-04-25T08:30:00Z", ip: "196.0.0.1" },
  { id: "a2",  userId: "2", userName: "Ama Owusu",     action: "User Assigned",      entityType: "user",    entityId: "5",       description: "Assigned Fatou Diallo to Notify and CRM products",   productId: "crm",     timestamp: "2025-04-24T14:00:00Z", ip: "196.0.0.2" },
  { id: "a3",  userId: "5", userName: "Fatou Diallo",  action: "Ticket Updated",     entityType: "ticket",  entityId: "TKT-002", description: "Status changed to In Progress",                        productId: "notify",  timestamp: "2025-04-25T07:00:00Z", ip: "196.0.0.5" },
  { id: "a4",  userId: "6", userName: "Kwame Asante",  action: "API Key Generated",  entityType: "api_key", entityId: "ak_001",  description: "Generated production API key for TechCorp Ghana",                            timestamp: "2025-04-23T10:15:00Z", ip: "196.0.0.6" },
  { id: "a5",  userId: "1", userName: "Kofi Mensah",   action: "Role Changed",       entityType: "role",    entityId: "7",       description: "Nadia Osei role changed to Analyst / Viewer",                                timestamp: "2025-04-22T16:00:00Z", ip: "196.0.0.1" },
  { id: "a6",  userId: "3", userName: "James Quaye",   action: "Product Configured", entityType: "product", entityId: "notify",  description: "Updated Notify support email address",                 productId: "notify",  timestamp: "2025-04-21T11:30:00Z" },
  { id: "a7",  userId: "4", userName: "Abena Boateng", action: "Ticket Resolved",    entityType: "ticket",  entityId: "TKT-006", description: "Dedicated sending domain configured",                  productId: "notify",  timestamp: "2025-04-22T14:00:00Z" },
  { id: "a8",  userId: "1", userName: "Kofi Mensah",   action: "User Login",         entityType: "session", entityId: "1",       description: "Successful login from 196.0.0.1",                                            timestamp: "2025-04-25T08:00:00Z", ip: "196.0.0.1" },
  { id: "a9",  userId: "4", userName: "Abena Boateng", action: "Ticket Escalated",   entityType: "ticket",  entityId: "TKT-003", description: "Escalated to Technical Agent — Kwame Asante",         productId: "notify",  timestamp: "2025-04-24T12:00:00Z" },
  { id: "a10", userId: "1", userName: "Kofi Mensah",   action: "Product Created",    entityType: "product", entityId: "crm",     description: "Created new product: CRM",                                                   timestamp: "2025-04-20T10:00:00Z", ip: "196.0.0.1" },
  { id: "a11", userId: "1", userName: "Kofi Mensah",   action: "User Assigned",      entityType: "user",    entityId: "4",       description: "Assigned Abena Boateng to Payments product",          productId: "payments",timestamp: "2025-04-20T10:30:00Z", ip: "196.0.0.1" },
  { id: "a12", userId: "3", userName: "James Quaye",   action: "Ticket Updated",     entityType: "ticket",  entityId: "TKT-009", description: "Pipeline automation ticket moved to In Progress",      productId: "crm",     timestamp: "2025-04-25T08:00:00Z" },
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

  // Loading state for initial backend data fetch
  const [isLoadingBackendData, setIsLoadingBackendData] = useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePage, setActivePage]             = useState("dashboard");
  const [activeProductId, setActiveProductId]   = useState("notify");
  const [activeProductTab, setActiveProductTab] = useState("overview");

  // ── Backend data loading ──────────────────────────────────────────────────
  useEffect(() => {
    const token = currentUser.token;
    if (!token) return; // Seed/demo auth — skip backend fetch

    setIsLoadingBackendData(true);

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
        const roleId = await resolveRoleId(token!, currentUser.role);
        if (roleId) {
          // Permissions
          try {
            const perms = await fetchRolePermissions(token!, roleId);
            if (perms.length > 0) setDynamicPermissions(perms);
          } catch {
            // ROLE_PERMISSIONS fallback stays
          }

          // Sidebar items
          try {
            const items = await fetchRoleSidebarItems(token!, roleId);
            if (items.length > 0) setBackendSidebarItems(items);
          } catch {
            // Static NAV_ITEMS fallback stays
          }
        }
      } catch {
        // Role resolution failed — static fallbacks stay
      }

      setIsLoadingBackendData(false);
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
    (product: ControlProduct) =>
      setProducts((prev) => [...prev, product]),
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
        isLoadingBackendData,
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
