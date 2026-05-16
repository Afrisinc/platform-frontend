import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  X,
  ChevronDown,
  AlertCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import {
  usePlatform,
  SupportTicket,
  TicketStatus,
  TicketPriority,
} from "@/contexts/PlatformContext";
import { PageHeader } from "@/components/control/PageHeader";
import { StatusBadge } from "@/components/control/StatusBadge";
import { EmptyState } from "@/components/control/EmptyState";
import { StatCard } from "@/components/control/StatCard";
import { SectionLabel } from "@/components/control/SectionLabel";
import { UserAvatar } from "@/components/control/UserAvatar";

const STATUS_ORDER: TicketStatus[] = [
  "Open",
  "In Progress",
  "Escalated",
  "Waiting on Customer",
  "Resolved",
];

const STATUS_ICONS: Record<TicketStatus, React.ElementType> = {
  Open: AlertTriangle,
  "In Progress": Clock,
  Escalated: AlertCircle,
  "Waiting on Customer": Clock,
  Resolved: CheckCircle2,
};

// ── Ticket detail panel ───────────────────────────────────────────────────────
function TicketDetail({ ticket, onClose }: { ticket: SupportTicket; onClose: () => void }) {
  const { can, teamMembers } = usePlatform();
  const canRespond = can("respond_tickets");
  const canEscalate = can("escalate_tickets");
  const [reply, setReply] = useState("");
  const StatusIcon = STATUS_ICONS[ticket.status];

  const agents = teamMembers.filter(
    (m) => m.role === "support_agent" || m.role === "support_lead" || m.role === "technical_agent"
  );

  return (
    <>
      <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-full max-w-lg bg-card border-l border-border shadow-xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
              <StatusBadge label={ticket.status} variant="ticket-status" />
              <StatusBadge label={ticket.priority} variant="ticket-priority" />
            </div>
            <h2 className="text-sm font-semibold text-foreground leading-snug">{ticket.subject}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer info */}
          <div>
            <SectionLabel className="mb-3">Customer</SectionLabel>
            <div className="flex items-center gap-3">
              <UserAvatar
                initials={ticket.customerName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              />
              <div>
                <p className="text-sm font-medium text-foreground">{ticket.customerName}</p>
                <p className="text-xs text-muted-foreground">{ticket.customerEmail}</p>
              </div>
            </div>
          </div>

          {/* Ticket details */}
          <div>
            <SectionLabel className="mb-3">Details</SectionLabel>
            <div className="bg-muted/40 rounded-lg divide-y divide-border">
              {[
                {
                  label: "Product",
                  value: ticket.productId.charAt(0).toUpperCase() + ticket.productId.slice(1),
                },
                {
                  label: "Channel",
                  value: ticket.channel.charAt(0).toUpperCase() + ticket.channel.slice(1),
                },
                { label: "Assigned To", value: ticket.assignedTo ?? "Unassigned" },
                {
                  label: "Created",
                  value: new Date(ticket.createdAt).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                },
                {
                  label: "Last Updated",
                  value: new Date(ticket.updatedAt).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-muted-foreground">{row.label}</span>
                  <span
                    className={`text-sm font-medium text-foreground ${row.label === "Assigned To" && !ticket.assignedTo ? "italic text-muted-foreground" : ""}`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          {ticket.tags && ticket.tags.length > 0 && (
            <div>
              <SectionLabel className="mb-2">Tags</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {ticket.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground border border-border"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {canRespond && ticket.status !== "Resolved" && (
            <div>
              <SectionLabel className="mb-3">Reply to Customer</SectionLabel>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={4}
                placeholder="Type your response…"
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-shadow"
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  disabled={!reply.trim()}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  Send Reply
                </button>
                <button className="px-4 py-2 rounded-lg bg-success/10 text-success text-sm font-medium hover:bg-success/20 transition-colors border border-success/20">
                  Mark Resolved
                </button>
                {canEscalate && ticket.status !== "Escalated" && (
                  <button className="px-4 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors border border-destructive/20">
                    Escalate
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Assign */}
          {can("assign_users") && ticket.status !== "Resolved" && (
            <div>
              <SectionLabel className="mb-2">Assign To</SectionLabel>
              <div className="relative">
                <select className="w-full h-9 px-3 pr-8 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
                  <option value="">Unassigned</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name} — {a.role.replace("_", " ")}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SupportTicketsPage() {
  const { tickets, can } = usePlatform();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [selected, setSelected] = useState<SupportTicket | null>(null);

  const filtered = tickets.filter((t) => {
    const matchSearch =
      !search ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.customerName.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    const matchPriority = priorityFilter === "All" || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const open = tickets.filter((t) => t.status === "Open").length;
  const inProgress = tickets.filter((t) => t.status === "In Progress").length;
  const escalated = tickets.filter((t) => t.status === "Escalated").length;
  const resolved = tickets.filter((t) => t.status === "Resolved").length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Support Tickets"
        subtitle="Manage customer issues across all assigned products."
      >
        {can("respond_tickets") && (
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> New Ticket
          </button>
        )}
      </PageHeader>

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Open"
          value={open}
          icon={AlertTriangle}
          changeType="neutral"
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />
        <StatCard
          label="In Progress"
          value={inProgress}
          icon={Clock}
          changeType="neutral"
          iconBg="bg-warning/10"
          iconColor="text-warning"
        />
        <StatCard
          label="Escalated"
          value={escalated}
          icon={AlertCircle}
          changeType={escalated > 0 ? "negative" : "neutral"}
          iconBg="bg-destructive/10"
          iconColor="text-destructive"
        />
        <StatCard
          label="Resolved"
          value={resolved}
          icon={CheckCircle2}
          changeType="positive"
          iconBg="bg-success/10"
          iconColor="text-success"
        />
      </div>

      {/* Filters + table */}
      <div className="bg-card rounded-xl border border-border">
        {/* Filter bar */}
        <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tickets by subject, customer or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {STATUS_ORDER.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? "All" : s)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {(["All", "Critical", "High", "Medium", "Low"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  priorityFilter === p
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40">
                {["Ticket", "Customer", "Priority", "Status", "Assigned To", "Updated"].map(
                  (col) => (
                    <th
                      key={col}
                      className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      {col}
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
                      icon={CheckCircle2}
                      title="Your queue is clear."
                      description="No tickets match your current filters."
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const SIcon = STATUS_ICONS[t.status];
                  return (
                    <tr
                      key={t.id}
                      onClick={() => setSelected(t)}
                      className="hover:bg-muted/30 cursor-pointer transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          <SIcon
                            className={`h-4 w-4 mt-0.5 shrink-0 ${
                              t.status === "Escalated"
                                ? "text-destructive"
                                : t.status === "Resolved"
                                  ? "text-success"
                                  : t.status === "Open"
                                    ? "text-warning"
                                    : "text-muted-foreground"
                            }`}
                          />
                          <div>
                            <p className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {t.subject}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">{t.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-foreground">{t.customerName}</p>
                        <p className="text-xs text-muted-foreground">{t.customerEmail}</p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge label={t.priority} variant="ticket-priority" />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge label={t.status} variant="ticket-status" />
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {t.assignedTo ?? (
                          <span className="italic text-muted-foreground/60">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(t.updatedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing {filtered.length} of {tickets.length} tickets
            </p>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && <TicketDetail ticket={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
