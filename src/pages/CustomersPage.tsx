import { useState } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  X,
  Globe,
  Ticket,
  Key,
  Clock,
} from "lucide-react";
import { usePlatform, Customer } from "@/contexts/PlatformContext";
import { PageHeader } from "@/components/control/PageHeader";
import { StatusBadge } from "@/components/control/StatusBadge";
import { SectionLabel } from "@/components/control/SectionLabel";
import { EmptyState } from "@/components/control/EmptyState";
import { StatCard } from "@/components/control/StatCard";
import { UserAvatar } from "@/components/control/UserAvatar";

// ── Customer profile slide-over ────────────────────────────────────────────────
function CustomerProfile({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const { tickets, can } = usePlatform();
  const customerTickets = tickets.filter((t) => t.customerId === customer.id);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40" onClick={onClose} />
      {/* Panel */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Customer Profile</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Identity */}
          <div className="flex items-start gap-4">
            <UserAvatar
              initials={customer.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
              size="lg"
            />
            <div>
              <h3 className="font-semibold text-foreground">{customer.name}</h3>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
              <p className="text-sm text-muted-foreground">{customer.company}</p>
              <div className="mt-2">
                <StatusBadge label={customer.status} variant="account" />
              </div>
            </div>
          </div>

          {/* Basic info */}
          <div>
            <SectionLabel className="mb-3">Account Details</SectionLabel>
            <div className="bg-muted/40 rounded-lg divide-y divide-border">
              {[
                {
                  label: "Account Created",
                  value: new Date(customer.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }),
                },
                { label: "Last Activity", value: customer.lastActivity },
                {
                  label: "Products",
                  value: customer.products
                    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                    .join(", "),
                },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-muted-foreground">{row.label}</span>
                  <span className="text-sm font-medium text-foreground">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* API usage */}
          {customer.apiUsage !== undefined && (
            <div>
              <SectionLabel className="mb-3">Notify API Usage</SectionLabel>
              <div className="bg-primary/5 border border-primary/10 rounded-lg px-4 py-3 flex items-center gap-3">
                <Key className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {customer.apiUsage.toLocaleString()} requests
                  </p>
                  <p className="text-xs text-muted-foreground">Total API calls via Notify</p>
                </div>
              </div>
            </div>
          )}

          {/* Technical tab - only for technical_agent and super_admin */}
          {can("access_api_keys") && (
            <div>
              <SectionLabel className="mb-3">Technical Details</SectionLabel>
              <div className="bg-muted/40 rounded-lg divide-y divide-border">
                {[
                  { label: "API Key Prefix", value: "nf_live_••••••••" },
                  { label: "Webhook URL", value: "https://api.techcorp.gh/notify" },
                  { label: "Integration", value: "REST API v2" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span className="text-sm font-medium text-foreground font-mono text-xs">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Support history */}
          <div>
            <SectionLabel className="mb-3">Support History ({customerTickets.length})</SectionLabel>
            {customerTickets.length === 0 ? (
              <EmptyState
                icon={Ticket}
                title="No tickets found"
                description="This customer has not raised any support tickets."
              />
            ) : (
              <div className="space-y-2">
                {customerTickets.map((t) => (
                  <div key={t.id} className="bg-muted/40 rounded-lg px-4 py-3">
                    <div className="flex items-start gap-2 justify-between">
                      <p className="text-sm font-medium text-foreground leading-snug">
                        {t.subject}
                      </p>
                      <StatusBadge label={t.status} variant="ticket-status" />
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-muted-foreground">{t.id}</span>
                      <span className="text-muted-foreground/40">·</span>
                      <StatusBadge label={t.priority} variant="ticket-priority" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const { customers, can } = usePlatform();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selected, setSelected] = useState<Customer | null>(null);

  const filtered = customers.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeCount = customers.filter((c) => c.status === "Active").length;
  const suspendedCount = customers.filter((c) => c.status === "Suspended").length;
  const inactiveCount = customers.filter((c) => c.status === "Inactive").length;
  const isReadOnly = !can("edit_customers");

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Customers"
        subtitle="All customers across assigned products. Click a row to view the full profile."
      >
        {can("export_data") && (
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
            <ExternalLink className="h-3.5 w-3.5" /> Export
          </button>
        )}
      </PageHeader>

      {/* Stat row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Active"
          value={activeCount}
          icon={Globe}
          changeType="positive"
          iconBg="bg-success/10"
          iconColor="text-success"
        />
        <StatCard
          label="Suspended"
          value={suspendedCount}
          icon={Globe}
          changeType="negative"
          iconBg="bg-destructive/10"
          iconColor="text-destructive"
        />
        <StatCard
          label="Inactive"
          value={inactiveCount}
          icon={Clock}
          changeType="neutral"
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
        />
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email or company…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>
          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {["All", "Active", "Suspended", "Inactive"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-border bg-muted/40">
                {["Customer", "Company", "Status", "Products", "Last Activity", "API Usage"].map(
                  (col) => (
                    <th
                      key={col}
                      className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      <span className="flex items-center gap-1">
                        {col}
                        {col === "Last Activity" && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                      </span>
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Search}
                      title="No customers match your search."
                      description="Try adjusting the filters or search term."
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="hover:bg-muted/30 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          initials={c.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {c.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.company}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={c.status} variant="account" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.products.map((p) => (
                          <span
                            key={p}
                            className="px-2 py-0.5 rounded-full text-xs bg-accent text-accent-foreground border border-accent-foreground/10 font-medium"
                          >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{c.lastActivity}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {c.apiUsage !== undefined ? c.apiUsage.toLocaleString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {filtered.length} of {customers.length} customers
            </p>
            {isReadOnly && <p className="text-xs text-muted-foreground italic">Read-only view</p>}
          </div>
        )}
      </div>

      {/* Profile slide-over */}
      {selected && <CustomerProfile customer={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
