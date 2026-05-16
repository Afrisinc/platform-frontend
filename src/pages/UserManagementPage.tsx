import { useState } from "react";
import {
  UserPlus,
  Search,
  MoreHorizontal,
  X,
  ChevronDown,
  ShieldCheck,
  Lock,
  UserX,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { usePlatform, TeamMember, ControlRole, ROLE_LABELS } from "@/contexts/PlatformContext";
import { PageHeader } from "@/components/control/PageHeader";
import { StatusBadge } from "@/components/control/StatusBadge";
import { SectionLabel } from "@/components/control/SectionLabel";
import { EmptyState } from "@/components/control/EmptyState";
import { UserAvatar } from "@/components/control/UserAvatar";

// ── Add user modal ─────────────────────────────────────────────────────────────
function AddUserModal({ onClose }: { onClose: () => void }) {
  const { products } = usePlatform();
  const [role, setRole] = useState<ControlRole>("support_agent");
  const productRoles: ControlRole[] = [
    "product_manager",
    "support_lead",
    "support_agent",
    "technical_agent",
    "analyst",
  ];
  const needsProductAssignment = productRoles.includes(role);

  return (
    <>
      <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">Add New User</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="Kwame"
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Mensah"
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Work Email</label>
              <input
                type="email"
                placeholder="kwame@afrisinc.com"
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as ControlRole)}
                  className="w-full h-9 px-3 pr-8 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                >
                  {(Object.keys(ROLE_LABELS) as ControlRole[]).map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {role === "super_admin" && "Full access to everything — platform-wide."}
                {role === "ops_manager" && "Manages team structure across all products."}
                {role === "finance_admin" && "Access to billing and invoices only."}
                {role === "product_manager" && "Full control over assigned product(s)."}
                {role === "support_lead" && "Supervises agents on assigned product(s)."}
                {role === "support_agent" && "Handles day-to-day tickets on assigned product(s)."}
                {role === "technical_agent" && "Technical escalation handling — API, webhooks."}
                {role === "analyst" && "Read-only access to reports and dashboards."}
              </p>
            </div>

            {/* Product assignment — only for product-scoped roles */}
            {needsProductAssignment && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Assign Products
                </label>
                <div className="space-y-2">
                  {products.map((p) => (
                    <label key={p.id} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 rounded border-input accent-primary"
                      />
                      <span className="text-sm text-foreground">{p.name}</span>
                      <StatusBadge label={p.status} variant="product" />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              Send Invitation
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Member row actions menu ────────────────────────────────────────────────────
function MemberMenu({ member, onClose }: { member: TeamMember; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
        <div className="p-1">
          <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" /> Change Role
          </button>
          <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors">
            <RotateCcw className="h-4 w-4 text-muted-foreground" /> Reset Password
          </button>
          {member.status === "Locked" && (
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors">
              <CheckCircle2 className="h-4 w-4 text-success" /> Unlock Account
            </button>
          )}
          <div className="border-t border-border my-1" />
          {member.status === "Active" ? (
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
              <UserX className="h-4 w-4" /> Deactivate
            </button>
          ) : (
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-success hover:bg-success/10 rounded-lg transition-colors">
              <CheckCircle2 className="h-4 w-4" /> Reactivate
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function UserManagementPage() {
  const { teamMembers, products } = usePlatform();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const filtered = teamMembers.filter((m) => {
    const matchSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  const activeCount = teamMembers.filter((m) => m.status === "Active").length;
  const inactiveCount = teamMembers.filter((m) => m.status === "Inactive").length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="User Management"
        subtitle="Create, edit, and manage team members and their product assignments."
      >
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <UserPlus className="h-4 w-4" /> Add User
        </button>
      </PageHeader>

      {/* Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <SectionLabel className="mb-3">Team Overview</SectionLabel>
          <p className="text-3xl font-bold text-foreground">{teamMembers.length}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {activeCount} active · {inactiveCount} inactive
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <SectionLabel className="mb-3">Roles Assigned</SectionLabel>
          <div className="space-y-1.5 mt-1">
            {Object.entries(
              teamMembers.reduce<Record<string, number>>((acc, m) => {
                acc[m.role] = (acc[m.role] ?? 0) + 1;
                return acc;
              }, {})
            ).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {ROLE_LABELS[role as ControlRole]}
                </span>
                <span className="text-xs font-semibold text-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <SectionLabel className="mb-3">Product Access</SectionLabel>
          {products.map((p) => {
            const assignedCount = teamMembers.filter((m) => m.productAccess.includes(p.id)).length;
            return (
              <div key={p.id} className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-sm font-medium text-foreground">{p.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{assignedCount} members</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border">
        {/* Filters */}
        <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 px-3 pr-8 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
            >
              <option value="All">All Roles</option>
              {(Object.keys(ROLE_LABELS) as ControlRole[]).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Members table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40">
                {["Member", "Role", "Products", "Status", "Last Login", ""].map((col) => (
                  <th
                    key={col}
                    className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState icon={Search} title="No users match your search." />
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar initials={m.avatar} />
                        <div>
                          <p className="font-medium text-foreground">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-foreground">{ROLE_LABELS[m.role]}</span>
                    </td>
                    <td className="px-4 py-3">
                      {m.productAccess.length === 0 ? (
                        <span className="text-xs text-muted-foreground italic">None</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {m.productAccess.map((p) => (
                            <span
                              key={p}
                              className="px-2 py-0.5 rounded-full text-xs bg-accent text-accent-foreground border border-accent-foreground/10 font-medium"
                            >
                              {p.charAt(0).toUpperCase() + p.slice(1)}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={m.status} variant="account" />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{m.lastLogin}</td>
                    <td className="px-4 py-3 relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === m.id ? null : m.id)}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {menuOpen === m.id && (
                        <MemberMenu member={m} onClose={() => setMenuOpen(null)} />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {filtered.length} of {teamMembers.length} users shown
          </p>
        </div>
      </div>

      {showAddModal && <AddUserModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
