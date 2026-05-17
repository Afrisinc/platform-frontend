/**
 * SuperAdminDashboard
 * Unified super-admin control centre with four tabs:
 *   Users, Roles, Menus, Products
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  Shield,
  Layers,
  Package,
  Plus,
  Search,
  ChevronDown,
  MoreHorizontal,
  X,
  AlertCircle,
  UserPlus,
  Trash2,
  Edit2,
  CheckCircle,
  Ban,
  Globe,
  Code,
  Database,
  RefreshCw,
} from "lucide-react";
import { usePlatform, ROLE_LABELS, ControlRole } from "@/contexts/PlatformContext";
import { PageHeader } from "@/components/control/PageHeader";
import { StatCard } from "@/components/control/StatCard";
import { StatusBadge } from "@/components/control/StatusBadge";
import { EmptyState } from "@/components/control/EmptyState";
import { UserAvatar } from "@/components/control/UserAvatar";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminFormModal } from "@/components/admin/AdminFormModal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminRoles } from "@/hooks/useAdminRoles";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { useAdminSidebarItems } from "@/hooks/useAdminSidebarItems";
import { useRoleAssignments } from "@/hooks/useRoleAssignments";
import { useAdminUsers, useOrgMembers } from "@/hooks/useAdminUsers";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import type { Role, AdminUser, AdminProduct, SidebarItem, FormField } from "@/types/admin";
import { cn } from "@/lib/utils";

// ── Tab config ────────────────────────────────────────────────────────────────

type Tab = "users" | "roles" | "menus" | "products";

interface TabDef {
  id: Tab;
  label: string;
  icon: React.ElementType;
}

const TABS: TabDef[] = [
  { id: "users", label: "Users", icon: Users },
  { id: "roles", label: "Roles", icon: Shield },
  { id: "menus", label: "Menus", icon: Layers },
  { id: "products", label: "Products", icon: Package },
];

// ── Sidebar icon options (for menu management) ────────────────────────────────

const ICON_OPTIONS = [
  { value: "LayoutDashboard", label: "Dashboard" },
  { value: "Users", label: "Users" },
  { value: "UserCog", label: "User Settings" },
  { value: "Settings2", label: "Settings" },
  { value: "CreditCard", label: "Billing" },
  { value: "BarChart3", label: "Reports" },
  { value: "ClipboardList", label: "Audit" },
  { value: "Ticket", label: "Tickets" },
  { value: "Package", label: "Products" },
  { value: "ShieldCheck", label: "Security" },
  { value: "Bell", label: "Notifications" },
  { value: "Layers", label: "CRM" },
];

// ── Product status options ────────────────────────────────────────────────────

const PRODUCT_STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "PROVISIONING", label: "Provisioning" },
  { value: "COMING_SOON", label: "Coming Soon" },
  { value: "BETA", label: "Beta" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "DEPRECATED", label: "Deprecated" },
];

// ── Status badge helper ───────────────────────────────────────────────────────

function UserStatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { cls: string; label: string }> = {
    ACTIVE: {
      cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
      label: "Active",
    },
    INACTIVE: {
      cls: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
      label: "Inactive",
    },
    DORMANT: {
      cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      label: "Dormant",
    },
    SUSPENDED: {
      cls: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      label: "Suspended",
    },
    CLOSED: { cls: "bg-gray-200 text-gray-600", label: "Closed" },
  };
  const c = cfg[status] ?? { cls: "bg-gray-100 text-gray-600", label: status };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.cls}`}>{c.label}</span>;
}

function ProductStatusBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-800",
    PROVISIONING: "bg-blue-100 text-blue-800",
    COMING_SOON: "bg-purple-100 text-purple-800",
    BETA: "bg-amber-100 text-amber-800",
    SUSPENDED: "bg-red-100 text-red-800",
    DEPRECATED: "bg-gray-200 text-gray-600",
    LIVE: "bg-emerald-100 text-emerald-800",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

// ── Inline invite modal ───────────────────────────────────────────────────────

interface InviteModalProps {
  users: AdminUser[];
  roles: Role[];
  orgId: string;
  onInvite: (userId: string, roleId: string) => Promise<void>;
  onClose: () => void;
}

function InviteModal({ users, roles, orgId, onInvite, onClose }: InviteModalProps) {
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const filtered = search
    ? users.filter(
        (u) =>
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          ((u.firstName ?? "") + " " + (u.lastName ?? ""))
            .toLowerCase()
            .includes(search.toLowerCase())
      )
    : users.slice(0, 8);

  const handleSubmit = async () => {
    if (!selectedUserId || !selectedRoleId) {
      setError("Please select a user and a role.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onInvite(selectedUserId, selectedRoleId);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-xl shadow-xl border border-border w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" /> Invite User to Organisation
          </h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
            </div>
          )}

          {/* User search */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Search User</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Email or name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-border divide-y divide-border">
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground p-3">No users found</p>
              ) : (
                filtered.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedUserId(u.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 transition-colors",
                      selectedUserId === u.id && "bg-primary/5 border-l-2 border-primary"
                    )}
                  >
                    <UserAvatar
                      initials={
                        (u.firstName?.[0] ?? "") + (u.lastName?.[0] ?? "") ||
                        u.email[0].toUpperCase()
                      }
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {u.firstName || u.lastName
                          ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()
                          : u.email}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    {selectedUserId === u.id && (
                      <CheckCircle className="h-4 w-4 text-primary ml-auto shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Role selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Assign Role</label>
            <div className="relative">
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full h-9 px-3 pr-8 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
              >
                <option value="">Select a role…</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground text-sm hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedUserId || !selectedRoleId}
            className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />{" "}
                Inviting…
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" /> Invite
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Assignment modal (permissions / sidebar items) ────────────────────────────

interface AssignModalProps {
  title: string;
  availableItems: {
    id: string;
    name?: string;
    label?: string;
    description?: string;
    category?: string;
  }[];
  selectedIds: string[];
  onSubmit: (ids: string[]) => Promise<void>;
  onClose: () => void;
}

function AssignModal({ title, availableItems, selectedIds, onSubmit, onClose }: AssignModalProps) {
  const [selected, setSelected] = useState(new Set(selectedIds));
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filtered = availableItems.filter((i) => {
    const label = (i.name || i.label || "").toLowerCase();
    return !search || label.includes(search.toLowerCase());
  });

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(Array.from(selected));
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  // Group permissions by category
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, item) => {
    const cat = (item as any).category || "General";
    (acc[cat] = acc[cat] || []).push(item);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-xl border border-border shadow-xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background rounded-t-xl">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-9 pr-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{selected.size} selected</p>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              {Object.keys(grouped).length > 1 && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {category}
                </p>
              )}
              <div className="space-y-1">
                {items.map((item) => (
                  <label
                    key={item.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                      selected.has(item.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(item.id)}
                      onChange={() => toggle(item.id)}
                      className="mt-0.5 rounded border-input accent-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {item.name || item.label}
                      </p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground text-sm hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// USERS TAB
// ══════════════════════════════════════════════════════════════════════════════

function UsersTab({ token }: { token: string }) {
  const { users, total, loading, error, loadUsers, setUserStatus } = useAdminUsers(token);
  const { roles, loadRoles } = useAdminRoles(token);
  const { orgs, members, loadOrgs, loadMembers, inviteMember, kickMember } = useOrgMembers(token);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchDebounce, setSearchDebounce] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [confirmKick, setConfirmKick] = useState<{ userId: string; name: string } | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<{
    userId: string;
    status: string;
    name: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadUsers(1, 50);
    loadRoles();
    loadOrgs();
  }, []);

  useEffect(() => {
    if (selectedOrg) loadMembers(selectedOrg);
  }, [selectedOrg]);

  const handleSearch = (v: string) => {
    setSearch(v);
    if (searchDebounce) clearTimeout(searchDebounce);
    setSearchDebounce(setTimeout(() => loadUsers(1, 50, v, statusFilter), 400));
  };

  const handleStatusFilter = (v: string) => {
    setStatusFilter(v);
    loadUsers(1, 50, search, v || undefined);
  };

  const handleStatusToggle = async () => {
    if (!confirmStatus) return;
    setActionLoading(true);
    try {
      await setUserStatus(confirmStatus.userId, confirmStatus.status);
    } finally {
      setActionLoading(false);
      setConfirmStatus(null);
    }
  };

  const handleKick = async () => {
    if (!confirmKick || !selectedOrg) return;
    setActionLoading(true);
    try {
      await kickMember(selectedOrg, confirmKick.userId);
    } finally {
      setActionLoading(false);
      setConfirmKick(null);
    }
  };

  const activeCount = users.filter((u) => u.status === "ACTIVE").length;
  const suspendedCount = users.filter((u) => u.status === "SUSPENDED").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={total} />
        <StatCard title="Active" value={activeCount} />
        <StatCard title="Suspended" value={suspendedCount} />
        <StatCard title="Organisations" value={orgs.length} />
      </div>

      {/* All Users table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Platform Users</h3>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-8 pl-8 pr-3 rounded-lg border border-input bg-background text-sm w-full sm:w-52 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="h-8 px-3 pr-7 rounded-lg border border-input bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Status</option>
                {["ACTIVE", "INACTIVE", "DORMANT", "SUSPENDED", "CLOSED"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
            </div>
            <button
              onClick={() => loadUsers(1, 50, search, statusFilter)}
              className="h-8 px-3 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 m-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                {["User", "Status", "Joined", "Last Login", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center">
                    <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState icon={Users} title="No users found" />
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email;
                  const initials =
                    (u.firstName?.[0] ?? "") + (u.lastName?.[0] ?? "") || u.email[0].toUpperCase();
                  return (
                    <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar initials={initials} />
                          <div>
                            <p className="font-medium text-foreground">{name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <UserStatusBadge status={u.status} />
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : "Never"}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          {u.status === "ACTIVE" ? (
                            <button
                              onClick={() =>
                                setConfirmStatus({ userId: u.id, status: "SUSPENDED", name })
                              }
                              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Ban className="h-3 w-3" /> Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                setConfirmStatus({ userId: u.id, status: "ACTIVE", name })
                              }
                              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                            >
                              <CheckCircle className="h-3 w-3" /> Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {users.length} of {total} users
          </p>
        </div>
      </div>

      {/* Organisation Members section */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-foreground">Organisation Members</h3>
            {orgs.length > 0 && (
              <div className="relative">
                <select
                  value={selectedOrg}
                  onChange={(e) => setSelectedOrg(e.target.value)}
                  className="h-8 px-3 pr-7 rounded-lg border border-input bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select org…</option>
                  {orgs.map((o: any) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              </div>
            )}
          </div>
          {selectedOrg && (
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5" /> Invite User
            </button>
          )}
        </div>

        {!selectedOrg ? (
          <div className="py-12">
            <EmptyState icon={Users} title="Select an organisation to view members" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  {["Member", "Role", "Joined", ""].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState icon={Users} title="No members in this organisation" />
                    </td>
                  </tr>
                ) : (
                  members.map((m: any) => {
                    const u = m.user ?? {};
                    const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email;
                    const initials =
                      (u.firstName?.[0] ?? "") + (u.lastName?.[0] ?? "") ||
                      (u.email?.[0] ?? "?").toUpperCase();
                    return (
                      <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <UserAvatar initials={initials} />
                            <div>
                              <p className="font-medium text-foreground">{name}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {m.role?.name ?? "Member"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">
                          {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => setConfirmKick({ userId: u.id, name })}
                            className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showInvite && (
        <InviteModal
          users={users}
          roles={roles}
          orgId={selectedOrg}
          onInvite={(uid, rid) => inviteMember(selectedOrg, uid, rid)}
          onClose={() => setShowInvite(false)}
        />
      )}

      <ConfirmDialog
        title="Change User Status"
        message={`Are you sure you want to ${confirmStatus?.status === "SUSPENDED" ? "suspend" : "activate"} ${confirmStatus?.name}?`}
        confirmLabel={confirmStatus?.status === "SUSPENDED" ? "Suspend" : "Activate"}
        isOpen={!!confirmStatus}
        isDangerous={confirmStatus?.status === "SUSPENDED"}
        isLoading={actionLoading}
        onConfirm={handleStatusToggle}
        onCancel={() => setConfirmStatus(null)}
      />

      <ConfirmDialog
        title="Remove Member"
        message={`Remove ${confirmKick?.name} from this organisation?`}
        confirmLabel="Remove"
        isOpen={!!confirmKick}
        isDangerous
        isLoading={actionLoading}
        onConfirm={handleKick}
        onCancel={() => setConfirmKick(null)}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROLES TAB
// ══════════════════════════════════════════════════════════════════════════════

function RolesTab({ token }: { token: string }) {
  const { roles, loading, error, loadRoles, createRole, updateRole, deleteRole } =
    useAdminRoles(token);
  const { permissions: allPerms, loadPermissions } = useAdminPermissions(token);
  const { items: allSidebar, loadSidebarItems } = useAdminSidebarItems(token);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [assignType, setAssignType] = useState<"permissions" | "sidebar">("permissions");
  const [showAssign, setShowAssign] = useState(false);

  useEffect(() => {
    loadRoles();
    loadPermissions();
    loadSidebarItems();
  }, []);

  // Always call the hook; pass empty string when no role selected (hook guards internally)
  const assignments = useRoleAssignments(token, selectedRole?.id ?? "");

  useEffect(() => {
    if (selectedRole?.id) {
      assignments.loadRolePermissions();
      assignments.loadRoleSidebarItems();
    }
  }, [selectedRole?.id]);

  const formFields: FormField[] = [
    {
      name: "name",
      label: "Role Name",
      type: "text",
      placeholder: "e.g. Support Lead",
      value: editId ? (roles.find((r) => r.id === editId)?.name ?? "") : "",
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "What can this role do?",
      value: editId ? (roles.find((r) => r.id === editId)?.description ?? "") : "",
    },
  ];

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    if (editId) {
      await updateRole(editId, data.name as string, data.description as string);
      setEditId(null);
    } else {
      const r = await createRole(data.name as string, data.description as string);
      setSelectedRole(r);
    }
    setShowForm(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Roles list */}
      <div className="lg:col-span-1 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Roles</h3>
          <button
            onClick={() => {
              setEditId(null);
              setShowForm(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3 w-3" /> New Role
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        <div className="space-y-1">
          {loading && roles.length === 0 ? (
            <div className="py-8 text-center">
              <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : roles.length === 0 ? (
            <EmptyState icon={Shield} title="No roles yet" />
          ) : (
            roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRole(r)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-colors",
                  selectedRole?.id === r.id
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:bg-muted/50 text-foreground"
                )}
              >
                <div>
                  <p className="text-sm font-medium">{r.name}</p>
                  {r.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {r.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditId(r.id);
                      setShowForm(true);
                    }}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(r);
                    }}
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Role detail panel */}
      <div className="lg:col-span-2 space-y-4">
        {!selectedRole ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground text-sm border border-dashed border-border rounded-xl">
            Select a role to manage its permissions and menus
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{selectedRole.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {selectedRole.description || "No description"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Permissions</p>
                  <p className="text-xl font-bold text-foreground">
                    {assignments.permissions.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Menu Items</p>
                  <p className="text-xl font-bold text-foreground">
                    {assignments.sidebarItems.length}
                  </p>
                </div>
              </div>
            </div>

            {selectedRole && (
              <>
                {/* Permissions */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-foreground">Permissions</h4>
                    <button
                      onClick={() => {
                        setAssignType("permissions");
                        setShowAssign(true);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      Manage
                    </button>
                  </div>
                  {assignments.permissions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No permissions assigned</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {assignments.permissions.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-foreground"
                        >
                          {p.name}
                          <button
                            onClick={() => assignments.removePermission(p.id)}
                            className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sidebar items */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-foreground">Menu Items</h4>
                    <button
                      onClick={() => {
                        setAssignType("sidebar");
                        setShowAssign(true);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      Manage
                    </button>
                  </div>
                  {assignments.sidebarItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No menu items assigned</p>
                  ) : (
                    <div className="space-y-1.5">
                      {assignments.sidebarItems.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between px-3 py-2 bg-muted rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">{s.label}</p>
                            {s.path && (
                              <p className="text-xs text-muted-foreground font-mono">{s.path}</p>
                            )}
                          </div>
                          <button
                            onClick={() => assignments.removeSidebarItem(s.id)}
                            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AdminFormModal
        title={editId ? "Edit Role" : "Create Role"}
        fields={formFields}
        onSubmit={handleFormSubmit}
        onClose={() => {
          setShowForm(false);
          setEditId(null);
        }}
        isOpen={showForm}
        isLoading={loading}
      />

      <ConfirmDialog
        title="Delete Role"
        message={`Delete role "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isOpen={!!deleteTarget}
        isDangerous
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteRole(deleteTarget.id);
            setDeleteTarget(null);
            if (selectedRole?.id === deleteTarget.id) setSelectedRole(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      {showAssign && selectedRole && (
        <AssignModal
          title={assignType === "permissions" ? "Manage Permissions" : "Manage Menu Items"}
          availableItems={
            assignType === "permissions"
              ? allPerms.map((p) => ({
                  id: p.id,
                  name: p.name,
                  description: p.description,
                  category: p.category,
                }))
              : allSidebar.map((s) => ({ id: s.id, name: s.label, description: s.path }))
          }
          selectedIds={
            assignType === "permissions"
              ? assignments.permissions.map((p) => p.id)
              : assignments.sidebarItems.map((s) => s.id)
          }
          onSubmit={
            assignType === "permissions"
              ? (ids) => assignments.assignPermissions(ids)
              : (ids) => assignments.assignSidebarItems(ids)
          }
          onClose={() => setShowAssign(false)}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MENUS TAB
// ══════════════════════════════════════════════════════════════════════════════

function MenusTab({ token }: { token: string }) {
  const {
    items,
    loading,
    error,
    page,
    totalPages,
    loadSidebarItems,
    createSidebarItem,
    updateSidebarItem,
    deleteSidebarItem,
  } = useAdminSidebarItems(token);

  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SidebarItem | null>(null);

  useEffect(() => {
    loadSidebarItems(currentPage);
  }, [currentPage]);

  const formFields: FormField[] = [
    {
      name: "label",
      label: "Menu Label",
      type: "text",
      placeholder: "e.g. Dashboard",
      value: editId ? (items.find((i) => i.id === editId)?.label ?? "") : "",
      required: true,
    },
    {
      name: "icon",
      label: "Icon",
      type: "select",
      options: ICON_OPTIONS,
      value: editId ? (items.find((i) => i.id === editId)?.icon ?? "") : "",
    },
    {
      name: "path",
      label: "Route Path",
      type: "text",
      placeholder: "e.g. /dashboard",
      value: editId ? (items.find((i) => i.id === editId)?.path ?? "") : "",
    },
    {
      name: "order",
      label: "Sort Order",
      type: "number",
      value: editId ? (items.find((i) => i.id === editId)?.order ?? 0) : 0,
    },
  ];

  const handleSubmit = async (data: Record<string, unknown>) => {
    const payload = {
      label: data.label as string,
      icon: data.icon as string,
      path: data.path as string,
      order: parseInt(data.order as string) || 0,
    };
    if (editId) {
      await updateSidebarItem(editId, payload);
      setEditId(null);
    } else {
      await createSidebarItem(payload.label, payload.icon, payload.path, payload.order);
    }
    await loadSidebarItems(currentPage);
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Sidebar Menu Items</h3>
        <button
          onClick={() => {
            setEditId(null);
            setShowForm(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> New Menu Item
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <AdminTable<SidebarItem>
        columns={[
          {
            key: "label",
            label: "Label",
            render: (v) => <span className="font-medium">{String(v)}</span>,
          },
          { key: "icon", label: "Icon" },
          {
            key: "path",
            label: "Route",
            render: (v) => <span className="font-mono text-xs">{String(v || "—")}</span>,
          },
          {
            key: "order",
            label: "Order",
            render: (v) => <span className="font-mono text-xs">{String(v)}</span>,
          },
          {
            key: "isActive",
            label: "Status",
            render: (v) => (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${v ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}
              >
                {v ? "Active" : "Inactive"}
              </span>
            ),
          },
        ]}
        data={items}
        loading={loading}
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onEdit={(item) => {
          setEditId(item.id);
          setShowForm(true);
        }}
        onDelete={(item) => setDeleteTarget(item)}
      />

      <AdminFormModal
        title={editId ? "Edit Menu Item" : "Create Menu Item"}
        fields={formFields}
        onSubmit={handleSubmit}
        onClose={() => {
          setShowForm(false);
          setEditId(null);
        }}
        isOpen={showForm}
        isLoading={loading}
      />

      <ConfirmDialog
        title="Delete Menu Item"
        message={`Delete "${deleteTarget?.label}"?`}
        confirmLabel="Delete"
        isOpen={!!deleteTarget}
        isDangerous
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteSidebarItem(deleteTarget.id);
            setDeleteTarget(null);
            await loadSidebarItems(currentPage);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PRODUCTS TAB
// ══════════════════════════════════════════════════════════════════════════════

function ProductsTab({ token }: { token: string }) {
  const { products, enrollments, loading, error, loadProducts, createProduct, updateProduct } =
    useAdminProducts(token);

  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const getEnrollment = (productCode: string) =>
    enrollments.find((e) => e.productCode === productCode || e.productId === productCode);

  const formFields: FormField[] = editProduct
    ? [
        {
          name: "name",
          label: "Product Name",
          type: "text",
          value: editProduct.name,
          required: true,
        },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          value: editProduct.description ?? "",
        },
        {
          name: "baseUrl",
          label: "Base URL",
          type: "text",
          value: editProduct.baseUrl ?? "",
          placeholder: "https://api.example.com",
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          value: editProduct.status,
          options: PRODUCT_STATUSES,
        },
      ]
    : [
        {
          name: "name",
          label: "Product Name",
          type: "text",
          required: true,
          placeholder: "Notifications",
        },
        {
          name: "code",
          label: "Product Code",
          type: "text",
          required: true,
          placeholder: "NOTIFY",
        },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          placeholder: "Describe what this product does",
        },
        {
          name: "baseUrl",
          label: "Base URL",
          type: "text",
          placeholder: "https://api.example.com",
        },
        {
          name: "status",
          label: "Initial Status",
          type: "select",
          value: "PROVISIONING",
          options: PRODUCT_STATUSES,
        },
      ];

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (editProduct) {
      await updateProduct(editProduct.id, {
        name: data.name as string,
        description: data.description as string | undefined,
        baseUrl: data.baseUrl as string | undefined,
        status: data.status as string | undefined,
      });
      setEditProduct(null);
    } else {
      await createProduct({
        name: data.name as string,
        code: (data.code as string).toUpperCase(),
        description: data.description as string | undefined,
        baseUrl: data.baseUrl as string | undefined,
        status: (data.status as string) || "PROVISIONING",
      });
    }
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Products</h3>
        <button
          onClick={() => {
            setEditProduct(null);
            setShowForm(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> New Product
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {loading && products.length === 0 ? (
        <div className="py-16 text-center">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState icon={Package} title="No products yet. Create your first one." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map((p) => {
            const enroll = getEnrollment(p.code);
            return (
              <div
                key={p.id}
                onClick={() => setSelectedProduct(selectedProduct?.id === p.id ? null : p)}
                className={cn(
                  "bg-card border rounded-xl p-5 cursor-pointer transition-all",
                  selectedProduct?.id === p.id
                    ? "border-primary ring-1 ring-primary/30"
                    : "border-border hover:border-primary/40 hover:shadow-sm"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{p.code}</p>
                    </div>
                  </div>
                  <ProductStatusBadge status={p.status} />
                </div>

                {p.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{p.description}</p>
                )}

                {enroll && (
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">{enroll.totalEnrollments}</p>
                      <p className="text-[10px] text-muted-foreground">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-emerald-600">{enroll.active}</p>
                      <p className="text-[10px] text-muted-foreground">Active</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-muted-foreground">{enroll.suspended}</p>
                      <p className="text-[10px] text-muted-foreground">Suspended</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  {p.baseUrl && (
                    <a
                      href={p.baseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Globe className="h-3 w-3" /> API
                    </a>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditProduct(p);
                      setShowForm(true);
                    }}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground ml-auto transition-colors"
                  >
                    <Edit2 className="h-3 w-3" /> Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AdminFormModal
        title={editProduct ? `Edit ${editProduct.name}` : "Create Product"}
        fields={formFields}
        onSubmit={handleSubmit}
        onClose={() => {
          setShowForm(false);
          setEditProduct(null);
        }}
        isOpen={showForm}
        isLoading={loading}
        submitLabel={editProduct ? "Save Changes" : "Create Product"}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════

export default function SuperAdminDashboard() {
  const { currentUser } = usePlatform();
  const token = currentUser?.token ?? "";
  const [activeTab, setActiveTab] = useState<Tab>("users");

  if (currentUser.role !== "super_admin") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Super admin access required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Control Centre"
        subtitle="Manage users, roles, menus and products across the Afrisinc platform."
      />

      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-xl w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "users" && <UsersTab token={token} />}
        {activeTab === "roles" && <RolesTab token={token} />}
        {activeTab === "menus" && <MenusTab token={token} />}
        {activeTab === "products" && <ProductsTab token={token} />}
      </div>
    </div>
  );
}
