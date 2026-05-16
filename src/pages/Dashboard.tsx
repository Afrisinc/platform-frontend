import {
  Users,
  Ticket,
  BarChart3,
  Bell,
  Clock,
  TrendingUp,
  UserPlus,
  Key,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Zap,
} from "lucide-react";
import { usePlatform, ROLE_LABELS } from "@/contexts/PlatformContext";
import { PageHeader } from "@/components/control/PageHeader";
import { StatCard } from "@/components/control/StatCard";
import { StatusBadge } from "@/components/control/StatusBadge";
import { SectionLabel } from "@/components/control/SectionLabel";
import { UserAvatar } from "@/components/control/UserAvatar";

// ── Greeting ──────────────────────────────────────────────────────────────────
function firstName(name: string) {
  return name.split(" ")[0];
}

// ── Super Admin / Ops Manager view ────────────────────────────────────────────
function AdminDashboard() {
  const { customers, tickets, teamMembers, auditLog } = usePlatform();

  const openTickets = tickets.filter((t) => t.status === "Open").length;
  const escalated = tickets.filter((t) => t.status === "Escalated").length;
  const activeCustomers = customers.filter((c) => c.status === "Active").length;
  const activeMembers = teamMembers.filter((m) => m.status === "Active").length;

  return (
    <>
      {/* Stat row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Customers"
          value={activeCustomers}
          icon={Users}
          change="+3 this month"
          changeType="positive"
        />
        <StatCard
          label="Open Tickets"
          value={openTickets}
          icon={Ticket}
          change={escalated > 0 ? `${escalated} escalated` : "None escalated"}
          changeType={escalated > 0 ? "negative" : "neutral"}
          iconBg="bg-warning/10"
          iconColor="text-warning"
        />
        <StatCard
          label="Team Members"
          value={activeMembers}
          icon={Users}
          change={`${teamMembers.length - activeMembers} inactive`}
          changeType="neutral"
          iconBg="bg-success/10"
          iconColor="text-success"
        />
        <StatCard
          label="Notify API Calls"
          value="48.2K"
          icon={Zap}
          change="+12.5% vs last week"
          changeType="positive"
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent tickets */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <SectionLabel>Recent Tickets</SectionLabel>
            <span className="text-xs text-primary font-medium cursor-pointer hover:underline">
              View all
            </span>
          </div>
          <div className="space-y-3">
            {tickets.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="flex items-start gap-3 py-2 border-b border-border last:border-0"
              >
                <div className="mt-0.5">
                  {t.status === "Escalated" ? (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  ) : t.status === "Open" ? (
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{t.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.customerName} · {t.id}
                  </p>
                </div>
                <StatusBadge label={t.status} variant="ticket-status" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent audit log */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <SectionLabel>Audit Log — Recent</SectionLabel>
            <span className="text-xs text-primary font-medium cursor-pointer hover:underline">
              View all
            </span>
          </div>
          <div className="space-y-3">
            {auditLog.slice(0, 5).map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 py-2 border-b border-border last:border-0"
              >
                <UserAvatar
                  initials={event.userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{event.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{event.description}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  {new Date(event.timestamp).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-card rounded-xl border border-border p-6">
        <SectionLabel className="mb-4">Quick Actions</SectionLabel>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <UserPlus className="h-4 w-4" /> Add Team Member
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition-colors">
            <Key className="h-4 w-4" /> Create API Key
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition-colors">
            <BarChart3 className="h-4 w-4" /> View Reports
          </button>
          <a
            href="https://notify.afrisinc.com/app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition-colors"
          >
            <Bell className="h-4 w-4" /> Open Notify <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </>
  );
}

// ── Product Manager view ───────────────────────────────────────────────────────
function ProductManagerDashboard() {
  const { tickets, customers } = usePlatform();
  const notifyTickets = tickets.filter((t) => t.productId === "notify");
  const openCount = notifyTickets.filter((t) => t.status === "Open").length;
  const resolvedToday = notifyTickets.filter((t) => t.status === "Resolved").length;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Notify Customers"
          value={customers.length}
          icon={Users}
          change="All assigned to Notify"
          changeType="neutral"
        />
        <StatCard
          label="Open Tickets"
          value={openCount}
          icon={Ticket}
          changeType="neutral"
          iconBg="bg-warning/10"
          iconColor="text-warning"
        />
        <StatCard
          label="Resolved Tickets"
          value={resolvedToday}
          icon={CheckCircle2}
          change="All time"
          changeType="neutral"
          iconBg="bg-success/10"
          iconColor="text-success"
        />
      </div>
      <div className="bg-card rounded-xl border border-border p-6">
        <SectionLabel className="mb-4">Notify — Open Tickets</SectionLabel>
        <div className="space-y-3">
          {notifyTickets
            .filter((t) => t.status !== "Resolved")
            .map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 py-2 border-b border-border last:border-0"
              >
                <StatusBadge label={t.priority} variant="ticket-priority" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.subject}</p>
                  <p className="text-xs text-muted-foreground">{t.customerName}</p>
                </div>
                <StatusBadge label={t.status} variant="ticket-status" />
              </div>
            ))}
        </div>
      </div>
    </>
  );
}

// ── Support Agent / Lead view ──────────────────────────────────────────────────
function SupportDashboard() {
  const { tickets, currentUser } = usePlatform();
  const myTickets = tickets.filter((t) => t.assignedTo === currentUser.name || t.status === "Open");

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="My Open Tickets"
          value={myTickets.filter((t) => t.status === "Open" || t.status === "In Progress").length}
          icon={Ticket}
          changeType="neutral"
          iconBg="bg-warning/10"
          iconColor="text-warning"
        />
        <StatCard
          label="Awaiting Customer"
          value={myTickets.filter((t) => t.status === "Waiting on Customer").length}
          icon={Clock}
          changeType="neutral"
        />
        <StatCard
          label="Resolved This Week"
          value={tickets.filter((t) => t.status === "Resolved").length}
          icon={CheckCircle2}
          change="All agents"
          changeType="positive"
          iconBg="bg-success/10"
          iconColor="text-success"
        />
      </div>
      <div className="bg-card rounded-xl border border-border p-6">
        <SectionLabel className="mb-4">My Queue</SectionLabel>
        {myTickets.length === 0 ? (
          <div className="py-10 text-center">
            <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="text-sm font-medium">Your queue is clear. Everything is resolved.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myTickets.slice(0, 6).map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 py-2 border-b border-border last:border-0"
              >
                <StatusBadge label={t.priority} variant="ticket-priority" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.customerName} · {t.id}
                  </p>
                </div>
                <StatusBadge label={t.status} variant="ticket-status" />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ── Analyst view ───────────────────────────────────────────────────────────────
function AnalystDashboard() {
  const { tickets, customers } = usePlatform();
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Customers"
          value={customers.length}
          icon={Users}
          changeType="neutral"
        />
        <StatCard label="Total Tickets" value={tickets.length} icon={Ticket} changeType="neutral" />
        <StatCard
          label="Resolved"
          value={tickets.filter((t) => t.status === "Resolved").length}
          icon={CheckCircle2}
          change="All time"
          changeType="positive"
          iconBg="bg-success/10"
          iconColor="text-success"
        />
        <StatCard
          label="Escalated"
          value={tickets.filter((t) => t.status === "Escalated").length}
          icon={AlertCircle}
          changeType={
            tickets.filter((t) => t.status === "Escalated").length > 0 ? "negative" : "neutral"
          }
          iconBg="bg-destructive/10"
          iconColor="text-destructive"
        />
      </div>
      <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4 text-sm text-muted-foreground">
        <TrendingUp className="h-5 w-5 text-primary shrink-0" />
        <p>
          You have read-only access. Navigate to{" "}
          <strong className="text-foreground">Reports & Analytics</strong> for full charts and
          export options.
        </p>
      </div>
    </>
  );
}

// ── Finance Admin view ─────────────────────────────────────────────────────────
function FinanceDashboard() {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <SectionLabel className="mb-4">Billing Overview</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Current Plan", value: "Pro" },
          { label: "Next Invoice", value: "$49.00" },
          { label: "Due Date", value: "May 1, 2025" },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
            <p className="text-xl font-bold text-foreground">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Dashboard export ─────────────────────────────────────────────────────
export default function Dashboard() {
  const { currentUser } = usePlatform();
  const role = currentUser.role;

  const subtitleMap: Partial<Record<typeof role, string>> = {
    super_admin: "Platform overview — all products, team, and recent activity.",
    ops_manager: "Team overview — escalations, onboarding, and recent sign-ups.",
    product_manager: "Notify overview — delivery stats, tickets, and customer activity.",
    support_lead: "Support overview — queue status, escalations, and team performance.",
    support_agent: "Your queue — assigned tickets and today's activity.",
    technical_agent: "Technical queue — escalated issues awaiting your attention.",
    analyst: "Read-only summary — navigate to Reports for full analytics.",
    finance_admin: "Billing summary — subscription and payment status.",
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title={`Welcome back, ${firstName(currentUser.name)}`}
        subtitle={subtitleMap[role]}
      />

      {(role === "super_admin" || role === "ops_manager") && <AdminDashboard />}
      {role === "product_manager" && <ProductManagerDashboard />}
      {(role === "support_agent" || role === "support_lead" || role === "technical_agent") && (
        <SupportDashboard />
      )}
      {role === "analyst" && <AnalystDashboard />}
      {role === "finance_admin" && <FinanceDashboard />}
    </div>
  );
}
