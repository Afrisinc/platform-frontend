import { useState, useEffect, useMemo } from "react";
import {
  BarChart2,
  Users,
  Ticket,
  Settings2,
  Bell,
  Layers,
  CreditCard,
  BarChart3,
  Package,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Mail,
  MessageSquare,
  Save,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  DollarSign,
  Zap,
  FileBarChart,
  ShieldCheck,
  X,
  RefreshCw,
  Search,
  UserPlus,
  Trash2,
  ArrowUpRight,
  Activity,
  Filter,
  ChevronDown,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { usePlatform } from "@/contexts/PlatformContext";
import {
  fetchNotifyOverview,
  fetchNotifyGrowth,
  type NotifyOverviewStats,
  type NotifyGrowthPoint,
} from "@/lib/platformApi";
import { useNotifyPlans, useNotifyAccounts, useAccountLimits } from "@/hooks/useNotifyAdmin";
import type { NotifyAccount, SetLimitOverridePayload } from "@/types/notifyAdmin";
import { SectionLabel } from "@/components/control/SectionLabel";
import { StatCard } from "@/components/control/StatCard";
import { StatusBadge } from "@/components/control/StatusBadge";
import { EmptyState } from "@/components/control/EmptyState";
import { UserAvatar } from "@/components/control/UserAvatar";
import { cn } from "@/lib/utils";

// ── Product icon + accent maps ────────────────────────────────────────────────
const PRODUCT_ICONS: Record<string, React.ElementType> = {
  notify: Bell,
  crm: Layers,
  payments: CreditCard,
  analytics: BarChart3,
};

const PRODUCT_ACCENT: Record<
  string,
  {
    icon: string;
    dot: string;
    ring: string;
    bar: string;
    badge: string;
  }
> = {
  notify: {
    icon: "text-primary",
    dot: "bg-primary",
    ring: "bg-primary/10 border-primary/20",
    bar: "from-primary/30 via-primary/10 to-transparent",
    badge: "bg-primary/10 text-primary border-primary/20",
  },
  crm: {
    icon: "text-emerald-600",
    dot: "bg-emerald-500",
    ring: "bg-emerald-50 border-emerald-200",
    bar: "from-emerald-500/25 via-emerald-500/8 to-transparent",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  payments: {
    icon: "text-amber-600",
    dot: "bg-amber-500",
    ring: "bg-amber-50 border-amber-200",
    bar: "from-amber-500/25 via-amber-500/8 to-transparent",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  analytics: {
    icon: "text-slate-500",
    dot: "bg-slate-400",
    ring: "bg-muted border-border",
    bar: "from-muted via-muted/30 to-transparent",
    badge: "bg-muted text-muted-foreground border-border",
  },
};

const TooltipStyle = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: 12,
    color: "hsl(var(--foreground))",
  },
};

// ── Static fallback chart data ─────────────────────────────────────────────────
const NOTIFY_DELIVERY_FALLBACK: NotifyGrowthPoint[] = [
  { date: "Apr 19", email: 1240, sms: 890, push: 320 },
  { date: "Apr 20", email: 1580, sms: 1020, push: 410 },
  { date: "Apr 21", email: 1320, sms: 940, push: 290 },
  { date: "Apr 22", email: 1740, sms: 1180, push: 520 },
  { date: "Apr 23", email: 1420, sms: 1050, push: 380 },
  { date: "Apr 24", email: 1890, sms: 1290, push: 610 },
  { date: "Apr 25", email: 2100, sms: 1380, push: 680 },
];
const NOTIFY_STATS_FALLBACK: NotifyOverviewStats = {
  totalSentToday: 10580,
  emailSentToday: 6140,
  smsSentToday: 3460,
  pushSentToday: 980,
  errorRateToday: 0.7,
  activeAccounts: 6,
  apiCallsToday: 8420,
};
const notifyErrorData = [
  { date: "Apr 19", rate: 1.2 },
  { date: "Apr 20", rate: 0.9 },
  { date: "Apr 21", rate: 2.1 },
  { date: "Apr 22", rate: 0.8 },
  { date: "Apr 23", rate: 1.1 },
  { date: "Apr 24", rate: 0.6 },
  { date: "Apr 25", rate: 0.7 },
];
const crmContactGrowth = [
  { date: "Apr 19", contacts: 1840 },
  { date: "Apr 20", contacts: 1870 },
  { date: "Apr 21", contacts: 1920 },
  { date: "Apr 22", contacts: 1950 },
  { date: "Apr 23", contacts: 2010 },
  { date: "Apr 24", contacts: 2080 },
  { date: "Apr 25", contacts: 2140 },
];
const crmPipelineData = [
  { stage: "Prospect", deals: 42 },
  { stage: "Qualified", deals: 28 },
  { stage: "Proposal", deals: 17 },
  { stage: "Negotiation", deals: 9 },
  { stage: "Won", deals: 24 },
];
const paymentsVolume = [
  { date: "Apr 19", volume: 84200 },
  { date: "Apr 20", volume: 96100 },
  { date: "Apr 21", volume: 78400 },
  { date: "Apr 22", volume: 112300 },
  { date: "Apr 23", volume: 98700 },
  { date: "Apr 24", volume: 124800 },
  { date: "Apr 25", volume: 138200 },
];
const paymentsSuccess = [
  { date: "Apr 19", rate: 97.2 },
  { date: "Apr 20", rate: 98.1 },
  { date: "Apr 21", rate: 96.8 },
  { date: "Apr 22", rate: 98.9 },
  { date: "Apr 23", rate: 97.5 },
  { date: "Apr 24", rate: 99.1 },
  { date: "Apr 25", rate: 98.7 },
];
const analyticsReports = [
  { date: "Apr 19", runs: 34 },
  { date: "Apr 20", runs: 41 },
  { date: "Apr 21", runs: 28 },
  { date: "Apr 22", runs: 52 },
  { date: "Apr 23", runs: 38 },
  { date: "Apr 24", runs: 61 },
  { date: "Apr 25", runs: 47 },
];

// ── Notify KPI strip ──────────────────────────────────────────────────────────
function NotifyKpiStrip({ token }: { token: string }) {
  const [stats, setStats] = useState<NotifyOverviewStats>(NOTIFY_STATS_FALLBACK);
  useEffect(() => {
    if (!token) return;
    fetchNotifyOverview(token)
      .then(setStats)
      .catch(() => {});
  }, [token]);

  const kpis = [
    { label: "Sent today", value: (stats.totalSentToday / 1000).toFixed(1) + "K" },
    { label: "API calls", value: (stats.apiCallsToday / 1000).toFixed(1) + "K" },
    { label: "Error rate", value: stats.errorRateToday.toFixed(1) + "%" },
    { label: "Active accounts", value: String(stats.activeAccounts) },
  ];
  return (
    <div className="flex items-center gap-5 flex-wrap mt-2">
      {kpis.map((k, i) => (
        <div key={k.label} className={cn("pr-5", i < kpis.length - 1 && "border-r border-border")}>
          <p className="text-xs text-muted-foreground leading-none mb-0.5">{k.label}</p>
          <p className="text-sm font-bold text-foreground">{k.value}</p>
        </div>
      ))}
    </div>
  );
}

// ── Service Health Strip ──────────────────────────────────────────────────────
const CHANNEL_HEALTH = [
  { label: "Email", uptime: "99.9%", latency: "142ms", ok: true, icon: Mail },
  { label: "SMS", uptime: "99.7%", latency: "284ms", ok: true, icon: MessageSquare },
  { label: "Push", uptime: "99.8%", latency: "98ms", ok: true, icon: Bell },
  { label: "Webhooks", uptime: "99.5%", latency: "—", ok: true, icon: Zap },
];

function ServiceHealthBar() {
  return (
    <div className="flex items-center gap-2 p-3 bg-success/5 border border-success/20 rounded-xl flex-wrap">
      <div className="flex items-center gap-1.5 mr-2 shrink-0">
        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="text-xs font-semibold text-success">All Systems Operational</span>
      </div>
      <div className="h-4 w-px bg-border mx-1 shrink-0 hidden sm:block" />
      {CHANNEL_HEALTH.map((ch) => (
        <div
          key={ch.label}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border border-border text-xs"
        >
          <ch.icon className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium text-foreground">{ch.label}</span>
          <span className={cn("font-semibold", ch.ok ? "text-success" : "text-destructive")}>
            {ch.uptime}
          </span>
          <span className="text-muted-foreground hidden md:inline">· {ch.latency}</span>
        </div>
      ))}
    </div>
  );
}

// ── Overview components per product ──────────────────────────────────────────

function NotifyOverview() {
  const { customers, tickets, currentUser } = usePlatform();
  const notifyTickets = tickets.filter((t) => t.productId === "notify");
  const [stats, setStats] = useState<NotifyOverviewStats>(NOTIFY_STATS_FALLBACK);
  const [growth, setGrowth] = useState<NotifyGrowthPoint[]>(NOTIFY_DELIVERY_FALLBACK);

  useEffect(() => {
    const token = currentUser.token;
    if (!token) return;
    fetchNotifyOverview(token)
      .then(setStats)
      .catch(() => {});
    fetchNotifyGrowth(token)
      .then((g) => {
        if (g.length > 0) setGrowth(g);
      })
      .catch(() => {});
  }, [currentUser.token]);

  const activeNotifyCustomers = customers.filter(
    (c) => c.status === "Active" && c.products.includes("notify")
  ).length;

  const total = stats.emailSentToday + stats.smsSentToday + stats.pushSentToday || 1;
  const channels = [
    {
      label: "Email",
      icon: Mail,
      pct: Math.round((stats.emailSentToday / total) * 100),
      color: "bg-primary",
      stroke: "hsl(var(--primary))",
      value: (stats.emailSentToday / 1000).toFixed(1) + "K",
    },
    {
      label: "SMS",
      icon: MessageSquare,
      pct: Math.round((stats.smsSentToday / total) * 100),
      color: "bg-success",
      stroke: "hsl(var(--success))",
      value: (stats.smsSentToday / 1000).toFixed(1) + "K",
    },
    {
      label: "Push",
      icon: Bell,
      pct: Math.round((stats.pushSentToday / total) * 100),
      color: "bg-warning",
      stroke: "hsl(var(--warning))",
      value: (stats.pushSentToday / 1000).toFixed(1) + "K",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Service health */}
      <ServiceHealthBar />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Customers"
          value={activeNotifyCustomers}
          icon={Users}
          changeType="positive"
          change="+2 this month"
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />
        <StatCard
          label="Messages Sent Today"
          value={stats.totalSentToday.toLocaleString()}
          icon={Bell}
          changeType="positive"
          change="+8.4% vs yesterday"
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />
        <StatCard
          label="API Calls Today"
          value={stats.apiCallsToday.toLocaleString()}
          icon={Zap}
          changeType="positive"
          change="+5.3% vs yesterday"
          iconBg="bg-success/10"
          iconColor="text-success"
        />
        <StatCard
          label="Error Rate"
          value={`${stats.errorRateToday.toFixed(2)}%`}
          icon={AlertTriangle}
          changeType="positive"
          change="↓ 0.1% vs yesterday"
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
        />
      </div>

      {/* Delivery volume chart — all 3 channels */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <SectionLabel>Delivery Volume — Last 7 Days</SectionLabel>
            <p className="text-xs text-muted-foreground mt-0.5">
              Notifications delivered across email, SMS and push channels
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
            {channels.map((ch) => (
              <div key={ch.label} className="flex items-center gap-1.5">
                <span className={cn("w-2.5 h-2.5 rounded-full", ch.color)} />
                {ch.label}
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={growth}>
            <defs>
              <linearGradient id="emailG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="smsG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pushG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v)}
            />
            <Tooltip {...TooltipStyle} />
            <Area
              type="monotone"
              dataKey="email"
              name="Email"
              stroke="hsl(var(--primary))"
              fill="url(#emailG)"
              strokeWidth={2}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="sms"
              name="SMS"
              stroke="hsl(var(--success))"
              fill="url(#smsG)"
              strokeWidth={2}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="push"
              name="Push"
              stroke="hsl(var(--warning))"
              fill="url(#pushG)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row: Channel breakdown + Error rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Channel usage breakdown */}
        <div className="bg-card rounded-xl border border-border p-6">
          <SectionLabel className="mb-1">Channel Breakdown Today</SectionLabel>
          <p className="text-xs text-muted-foreground mb-5">
            Distribution of messages sent per channel
          </p>
          <div className="space-y-4">
            {channels.map((ch) => (
              <div key={ch.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <ch.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{ch.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground tabular-nums">{ch.value}</span>
                    <span className="text-sm font-bold tabular-nums w-9 text-right">{ch.pct}%</span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${ch.color} transition-all`}
                    style={{ width: `${ch.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-border grid grid-cols-3 gap-3">
            {channels.map((ch) => (
              <div key={ch.label} className="text-center">
                <p className="text-base font-bold text-foreground tabular-nums">{ch.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{ch.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Error rate chart */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-start justify-between mb-1">
            <div>
              <SectionLabel>Delivery Error Rate</SectionLabel>
              <p className="text-xs text-muted-foreground mt-0.5">
                Failures as % of total sends — last 7 days
              </p>
            </div>
            <div
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-semibold border",
                stats.errorRateToday < 1.5
                  ? "bg-success/10 text-success border-success/20"
                  : "bg-warning/10 text-warning border-warning/20"
              )}
            >
              {stats.errorRateToday.toFixed(2)}% today
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180} className="mt-4">
            <BarChart data={notifyErrorData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                unit="%"
                domain={[0, 3]}
              />
              <Tooltip {...TooltipStyle} formatter={(v: number) => [`${v}%`, "Error Rate"]} />
              <Bar
                dataKey="rate"
                name="Error Rate"
                fill="hsl(var(--destructive))"
                radius={[4, 4, 0, 0]}
                opacity={0.75}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent events feed */}
      <div className="bg-card rounded-xl border border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <SectionLabel>Recent Events</SectionLabel>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
        <div className="divide-y divide-border">
          {[
            {
              time: "2 min ago",
              type: "success",
              msg: "2,100 email notifications delivered — TechCorp Ghana batch",
              detail: "Email · Batch",
            },
            {
              time: "18 min ago",
              type: "warning",
              msg: "SMS delivery failure — TradeX Nigeria (1 of 340 failed)",
              detail: "SMS · Failure",
            },
            {
              time: "1 hour ago",
              type: "success",
              msg: "Webhook confirmed — FinPay Solutions event subscription",
              detail: "Webhook · Delivery",
            },
            {
              time: "3 hours ago",
              type: "warning",
              msg: "Bounce rate spike for .ng domains — auto-throttle applied",
              detail: "Email · Bounce",
            },
            {
              time: "5 hours ago",
              type: "info",
              msg: "New API key generated for PayStack Partners",
              detail: "API · Key",
            },
          ].map((ev, i) => (
            <div
              key={i}
              className="flex items-start gap-3 px-6 py-4 hover:bg-muted/20 transition-colors"
            >
              <div
                className={cn(
                  "mt-0.5 w-2 h-2 rounded-full shrink-0 mt-1.5",
                  ev.type === "success"
                    ? "bg-success"
                    : ev.type === "warning"
                      ? "bg-warning"
                      : "bg-primary"
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-snug">{ev.msg}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{ev.detail}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                {ev.time}
              </span>
            </div>
          ))}
        </div>
        <div className="px-6 py-3 border-t border-border">
          <button className="text-xs font-medium text-primary hover:underline">
            View full event log →
          </button>
        </div>
      </div>

      {/* Open tickets summary */}
      {notifyTickets.filter((t) => t.status !== "Resolved").length > 0 && (
        <div className="flex items-center gap-3 bg-warning/5 border border-warning/20 rounded-xl px-5 py-4">
          <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
          <p className="text-sm text-foreground flex-1">
            <span className="font-semibold">
              {notifyTickets.filter((t) => t.status !== "Resolved").length} open support ticket
              {notifyTickets.filter((t) => t.status !== "Resolved").length !== 1 ? "s" : ""}
            </span>{" "}
            for the Notify product —{" "}
            <span className="text-muted-foreground">
              check the Support Tickets tab for details.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

function CrmOverview() {
  const { tickets } = usePlatform();
  const crmTickets = tickets.filter((t) => t.productId === "crm");
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Contacts"
          value="2,140"
          icon={Users}
          changeType="positive"
          change="+60 this week"
          iconBg="bg-success/10"
          iconColor="text-success"
        />
        <StatCard
          label="Active Deals"
          value="96"
          icon={TrendingUp}
          changeType="positive"
          change="+8 vs last week"
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />
        <StatCard
          label="Open Tickets"
          value={crmTickets.filter((t) => t.status !== "Resolved").length}
          icon={Ticket}
          changeType="neutral"
          iconBg="bg-warning/10"
          iconColor="text-warning"
        />
        <StatCard
          label="Conversion Rate"
          value="24.8%"
          icon={BarChart3}
          changeType="positive"
          change="+1.2% this month"
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
        />
      </div>
      <div className="bg-card rounded-xl border border-border p-6">
        <SectionLabel className="mb-1">Contact Growth — Last 7 Days</SectionLabel>
        <p className="text-xs text-muted-foreground mt-0.5 mb-5">Total contacts in the CRM</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={crmContactGrowth}>
            <defs>
              <linearGradient id="crmG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.25} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              domain={["auto", "auto"]}
            />
            <Tooltip {...TooltipStyle} />
            <Area
              type="monotone"
              dataKey="contacts"
              name="Contacts"
              stroke="hsl(var(--success))"
              fill="url(#crmG)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-card rounded-xl border border-border p-6">
        <SectionLabel className="mb-4">Deal Pipeline by Stage</SectionLabel>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={crmPipelineData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              dataKey="stage"
              type="category"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip {...TooltipStyle} />
            <Bar
              dataKey="deals"
              name="Deals"
              fill="hsl(var(--success))"
              radius={[0, 4, 4, 0]}
              opacity={0.8}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function PaymentsOverview() {
  const { tickets } = usePlatform();
  const payTickets = tickets.filter((t) => t.productId === "payments");
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Revenue Today"
          value="$138.2K"
          icon={DollarSign}
          changeType="positive"
          change="+10.8% vs yesterday"
          iconBg="bg-warning/10"
          iconColor="text-warning"
        />
        <StatCard
          label="Transactions"
          value="1,284"
          icon={CreditCard}
          changeType="positive"
          change="+92 vs yesterday"
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />
        <StatCard
          label="Open Tickets"
          value={payTickets.filter((t) => t.status !== "Resolved").length}
          icon={Ticket}
          changeType="neutral"
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
        />
        <StatCard
          label="Success Rate"
          value="98.7%"
          icon={CheckCircle2}
          changeType="positive"
          change="↑ 0.4% vs yesterday"
          iconBg="bg-success/10"
          iconColor="text-success"
        />
      </div>
      <div className="bg-card rounded-xl border border-border p-6">
        <SectionLabel className="mb-1">Transaction Volume — Last 7 Days</SectionLabel>
        <p className="text-xs text-muted-foreground mt-0.5 mb-5">Total USD processed per day</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={paymentsVolume}>
            <defs>
              <linearGradient id="payG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.25} />
                <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip
              {...TooltipStyle}
              formatter={(v: number) => [`$${v.toLocaleString()}`, "Volume"]}
            />
            <Area
              type="monotone"
              dataKey="volume"
              name="Volume"
              stroke="hsl(var(--warning))"
              fill="url(#payG)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-card rounded-xl border border-border p-6">
        <SectionLabel className="mb-1">Success Rate (%)</SectionLabel>
        <p className="text-xs text-muted-foreground mb-4">Successful transactions as % of total</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={paymentsSuccess}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              unit="%"
              domain={[94, 100]}
            />
            <Tooltip {...TooltipStyle} />
            <Bar
              dataKey="rate"
              name="Success Rate"
              fill="hsl(var(--success))"
              radius={[4, 4, 0, 0]}
              opacity={0.8}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AnalyticsOverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Reports Run Today"
          value="47"
          icon={FileBarChart}
          changeType="positive"
          change="+9 vs yesterday"
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
        />
        <StatCard
          label="Active Dashboards"
          value="12"
          icon={BarChart3}
          changeType="neutral"
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
        />
        <StatCard
          label="Data Exports"
          value="8"
          icon={TrendingUp}
          changeType="neutral"
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
        />
        <StatCard
          label="Alerts Fired"
          value="3"
          icon={AlertTriangle}
          changeType="neutral"
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
        />
      </div>
      <div className="flex items-center gap-3 bg-warning/10 border border-warning/20 rounded-xl px-5 py-4">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">Product in Beta</p>
          <p className="text-sm text-muted-foreground">
            Analytics is currently in closed beta. Some features may be unavailable.
          </p>
        </div>
      </div>
      <div className="bg-card rounded-xl border border-border p-6">
        <SectionLabel className="mb-1">Report Runs — Last 7 Days</SectionLabel>
        <p className="text-xs text-muted-foreground mt-0.5 mb-5">
          Scheduled and manual report executions
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={analyticsReports}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip {...TooltipStyle} />
            <Bar
              dataKey="runs"
              name="Reports"
              fill="hsl(var(--muted-foreground))"
              radius={[4, 4, 0, 0]}
              opacity={0.6}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Customers tab ─────────────────────────────────────────────────────────────
function CustomersTab({ productId }: { productId: string }) {
  const { customers } = usePlatform();
  const productCustomers = customers.filter((c) => c.products.includes(productId));
  if (productCustomers.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No customers yet"
        description="No customers are currently using this product."
      />
    );
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {productCustomers.length} customer{productCustomers.length !== 1 ? "s" : ""} using this
        product.
      </p>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              {["Customer", "Company", "API Calls", "Status", "Last Active"].map((col) => (
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
            {productCustomers.map((c) => (
              <tr key={c.id} className="hover:bg-muted/20 transition-colors">
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
                      <p className="font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.company}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  {(c.apiUsage ?? 0).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge label={c.status} variant="account" />
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{c.lastActivity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tickets tab ───────────────────────────────────────────────────────────────
function TicketsTab({ productId }: { productId: string }) {
  const { tickets } = usePlatform();
  const productTickets = tickets.filter((t) => t.productId === productId);
  const open = productTickets.filter((t) => t.status !== "Resolved");
  const resolved = productTickets.filter((t) => t.status === "Resolved");
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {open.length} active · {resolved.length} resolved
      </p>
      {open.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Queue is clear"
          description="No open tickets for this product."
        />
      ) : (
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          {open.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-xs font-mono text-muted-foreground">{t.id}</span>
                  <StatusBadge label={t.priority} variant="ticket-priority" />
                </div>
                <p className="text-sm font-medium text-foreground">{t.subject}</p>
                <p className="text-xs text-muted-foreground">{t.customerName}</p>
              </div>
              <StatusBadge label={t.status} variant="ticket-status" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Settings tab ──────────────────────────────────────────────────────────────
function SettingsTab({ productId }: { productId: string }) {
  const { can, products } = usePlatform();
  const canConfigure = can("configure_product");
  const product = products.find((p) => p.id === productId);
  return (
    <div className="space-y-5">
      {!canConfigure && (
        <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm text-muted-foreground">
          <AlertTriangle className="h-4 w-4 shrink-0" /> You have read-only access to product
          settings.
        </div>
      )}
      <div className="bg-card rounded-xl border border-border p-6 space-y-5">
        <SectionLabel>{product?.name ?? "Product"} Configuration</SectionLabel>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Support Email</label>
          <input
            type="email"
            defaultValue={product?.supportEmail ?? ""}
            disabled={!canConfigure}
            className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Product Code</label>
          <input
            type="text"
            defaultValue={product?.code ?? ""}
            disabled
            className="w-full h-9 px-3 rounded-lg border border-input bg-muted text-muted-foreground text-sm font-mono cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            Product codes cannot be changed after creation.
          </p>
        </div>
        <div className="border-t border-border pt-5">
          <SectionLabel className="mb-3">Feature Toggles</SectionLabel>
          <div className="space-y-3">
            {[
              {
                label: "Public API access",
                desc: "Allow customers to call this product's API",
                enabled: true,
              },
              {
                label: "Webhook events",
                desc: "Emit webhook events on key state changes",
                enabled: true,
              },
              {
                label: "Sandbox / test mode",
                desc: "Enable a sandbox environment for developers",
                enabled: false,
              },
            ].map((feat) => (
              <div key={feat.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{feat.label}</p>
                  <p className="text-xs text-muted-foreground">{feat.desc}</p>
                </div>
                <button disabled={!canConfigure}>
                  {feat.enabled ? (
                    <ToggleRight
                      className={`h-6 w-6 ${canConfigure ? "text-primary" : "text-muted-foreground"}`}
                    />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
        {canConfigure && (
          <div className="flex justify-end pt-2">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <Save className="h-4 w-4" /> Save Settings
            </button>
          </div>
        )}
      </div>
      <a
        href={`https://${productId}.afrisinc.com/settings`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors group"
      >
        <div>
          <p className="text-sm font-medium text-foreground">Advanced {product?.name} Settings</p>
          <p className="text-xs text-muted-foreground">
            API keys, rate limits, webhooks, integrations
          </p>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </a>
    </div>
  );
}

// ── Plans & Users constants ───────────────────────────────────────────────────
const PLAN_LIMIT_LABELS: Record<string, string> = {
  emails_per_month: "Emails / month",
  sms_per_month: "SMS / month",
  push_per_month: "Push / month",
  contacts: "Contacts",
  apps: "Apps",
  api_keys: "API Keys",
  api_calls_per_month: "API Calls / month",
  team_members: "Team Members",
  templates: "Templates",
  retention_days: "Data Retention (days)",
  campaigns: "Campaigns",
  webhooks: "Webhooks",
};

const PLAN_BADGE: Record<string, string> = {
  FREE: "border-border text-muted-foreground bg-muted/30",
  PRO: "border-primary/30 text-primary bg-primary/5",
  ENTERPRISE: "border-amber-300 text-amber-700 bg-amber-50",
};

const PLAN_CARD: Record<string, string> = {
  FREE: "border-border",
  PRO: "border-primary/20 shadow-sm",
  ENTERPRISE: "border-amber-200 shadow-sm",
};

const STATUS_BADGE: Record<string, string> = {
  active: "text-success bg-success/10 border-success/20",
  trialing: "text-primary bg-primary/10 border-primary/20",
  suspended: "text-destructive bg-destructive/10 border-destructive/20",
  cancelled: "text-muted-foreground bg-muted border-border",
};

function fmt(v: number | null | undefined): string {
  if (v === -1 || v === null || v === undefined) return "∞";
  return v >= 1_000_000
    ? `${(v / 1_000_000).toFixed(1)}M`
    : v >= 1_000
      ? `${(v / 1_000).toFixed(0)}K`
      : String(v);
}

// ── Limit Override Modal ───────────────────────────────────────────────────────
function LimitsModal({
  account,
  token,
  onClose,
}: {
  account: NotifyAccount;
  token: string;
  onClose: () => void;
}) {
  const { limits, loading, saving, removing, error, loadLimits, setOverride, removeOverride } =
    useAccountLimits(token, account.accountId);
  const [metric, setMetric] = useState("emails_per_month");
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadLimits();
  }, [loadLimits]);

  const handleSet = async () => {
    if (!metric || value === "") return;
    const payload: SetLimitOverridePayload = {
      metric,
      temporary_limit: Number(value),
      reason: reason || "Admin override",
    };
    try {
      await setOverride(payload);
      setValue("");
      setReason("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      /* error shown via hook */
    }
  };

  const overrides = limits?.overrides ?? [];
  const displayName =
    (account.orgName ?? `${account.firstName ?? ""} ${account.lastName ?? ""}`.trim()) ||
    account.userEmail;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-2xl border border-border w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">Limit Overrides</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-muted-foreground">{displayName}</p>
              <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border">
                {account.accountId.slice(0, 8)}…
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {loading && (
            <p className="text-sm text-muted-foreground text-center py-4">Loading overrides…</p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Active overrides list */}
          {overrides.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Active Overrides
              </p>
              <div className="space-y-2">
                {overrides.map((o) => (
                  <div
                    key={o.metric}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-muted/40 border border-border"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {PLAN_LIMIT_LABELS[o.metric] ?? o.metric}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Custom limit:{" "}
                        <span className="font-semibold text-primary">{fmt(o.temporaryLimit)}</span>
                        {o.expiresAt && (
                          <span className="ml-2">
                            · Expires {new Date(o.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => removeOverride(o.metric)}
                      disabled={removing}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && overrides.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              No active overrides. This account uses the default plan limits.
            </p>
          )}

          {/* Add override form */}
          <div className={cn("pt-3", overrides.length > 0 && "border-t border-border")}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Set Override
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Metric
                </label>
                <select
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {Object.entries(PLAN_LIMIT_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    New Limit <span className="text-muted-foreground/70">(-1 = unlimited)</span>
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="e.g. 500000"
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Reason <span className="text-muted-foreground/70">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Upgrade trial"
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleSet}
            disabled={saving || value === ""}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              saved
                ? "bg-success text-white"
                : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            )}
          >
            {saving ? "Saving…" : saved ? "Saved ✓" : "Set Override"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add / Find User Modal ─────────────────────────────────────────────────────
function AddUserModal({
  token,
  onClose,
  onRefresh,
}: {
  token: string;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [search, setSearch] = useState("");
  const [searched, setSearched] = useState(false);
  const searchHook = useNotifyAccounts(token);

  const handleSearch = async () => {
    if (!search.trim()) return;
    await searchHook.loadAccounts(1, 20, search.trim());
    setSearched(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-2xl border border-border w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">Find or Add User</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Search for a Notify account to view or manage
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by email, name, or organisation…"
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searchHook.loading || !search.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {searchHook.loading ? "Searching…" : "Search"}
            </button>
          </div>

          {searched && searchHook.accounts.length === 0 && !searchHook.loading && (
            <div className="text-center py-6 text-sm text-muted-foreground">
              <UserPlus className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p className="font-medium text-foreground">No accounts found</p>
              <p className="text-xs mt-1">The user may not have signed up for this product yet.</p>
            </div>
          )}

          {searchHook.accounts.length > 0 && (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {searchHook.accounts.map((acc) => {
                const displayName =
                  (acc.orgName ?? `${acc.firstName ?? ""} ${acc.lastName ?? ""}`.trim()) ||
                  acc.userEmail;
                return (
                  <div
                    key={acc.accountId}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
                    onClick={() => {
                      onRefresh();
                      onClose();
                    }}
                  >
                    <UserAvatar initials={displayName.slice(0, 2).toUpperCase()} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{acc.userEmail}</p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border shrink-0",
                        PLAN_BADGE[acc.plan] ?? PLAN_BADGE.FREE
                      )}
                    >
                      {acc.plan}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                );
              })}
            </div>
          )}

          <div className="rounded-xl bg-muted/40 border border-border px-4 py-3">
            <p className="text-xs font-semibold text-foreground mb-1">User not signed up yet?</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Share the Notify sign-up link with them. Their account will appear here once they
              register, and you can manage their plan and limits.
            </p>
            <a
              href="https://notify.afrisinc.com/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> notify.afrisinc.com/signup
            </a>
          </div>
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Plans & Users main tab ─────────────────────────────────────────────────────
type PlansUsersView = "accounts" | "plans";

function PlansUsersTab() {
  const { currentUser } = usePlatform();
  const token = currentUser.token ?? "";

  const [view, setView] = useState<PlansUsersView>("accounts");
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editLimitsFor, setEditLimitsFor] = useState<NotifyAccount | undefined>(undefined);
  const [showAddUser, setShowAddUser] = useState(false);

  const plansHook = useNotifyPlans(token);
  const accountsHook = useNotifyAccounts(token);

  useEffect(() => {
    if (!token) return;
    plansHook.loadPlans();
    accountsHook.loadAccounts();
  }, [token]);

  const handleRefresh = () => {
    plansHook.loadPlans();
    accountsHook.loadAccounts();
  };

  // Derived account stats
  const accountStats = useMemo(() => {
    const all = accountsHook.accounts;
    return {
      total: all.length,
      active: all.filter((a) => a.status === "active").length,
      trialing: all.filter((a) => a.status === "trialing").length,
      suspended: all.filter((a) => a.status === "suspended").length,
      free: all.filter((a) => a.plan === "FREE").length,
      pro: all.filter((a) => a.plan === "PRO").length,
      enterprise: all.filter((a) => a.plan === "ENTERPRISE").length,
    };
  }, [accountsHook.accounts]);

  const filteredAccounts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return accountsHook.accounts.filter((a) => {
      const matchSearch =
        !q ||
        a.userEmail.toLowerCase().includes(q) ||
        (a.orgName ?? "").toLowerCase().includes(q) ||
        `${a.firstName ?? ""} ${a.lastName ?? ""}`.toLowerCase().includes(q);
      const matchPlan = planFilter === "all" || a.plan === planFilter;
      const matchStatus = statusFilter === "all" || a.status === statusFilter;
      return matchSearch && matchPlan && matchStatus;
    });
  }, [accountsHook.accounts, searchQuery, planFilter, statusFilter]);

  return (
    <div className="space-y-5">
      {/* ── View toggle + actions ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 p-1 bg-muted rounded-xl">
          {(["accounts", "plans"] as PlansUsersView[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                view === v
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {v === "accounts"
                ? `Accounts${accountStats.total > 0 ? ` (${accountStats.total})` : ""}`
                : "Plans"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {view === "accounts" && (
            <button
              onClick={() => setShowAddUser(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5" /> Add User
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={plansHook.loading || accountsHook.loading}
            title="Refresh"
            className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={cn(
                "h-3.5 w-3.5",
                (plansHook.loading || accountsHook.loading) && "animate-spin"
              )}
            />
          </button>
        </div>
      </div>

      {/* ── PLANS VIEW ─────────────────────────────────────────────────────── */}
      {view === "plans" && (
        <>
          {plansHook.error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" /> {plansHook.error}
            </div>
          )}
          {plansHook.loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-56 rounded-2xl bg-muted/40 animate-pulse border border-border"
                />
              ))}
            </div>
          )}
          {!plansHook.loading && plansHook.plans.length === 0 && (
            <EmptyState
              icon={ShieldCheck}
              title="No plans found"
              description="Subscription plans are seeded in the Notify service. Check the DB or run the plan seed."
            />
          )}
          {plansHook.plans.length > 0 && (
            <>
              {/* Plan subscriber summary */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "FREE", count: accountStats.free, badge: PLAN_BADGE.FREE },
                  { label: "PRO", count: accountStats.pro, badge: PLAN_BADGE.PRO },
                  {
                    label: "ENTERPRISE",
                    count: accountStats.enterprise,
                    badge: PLAN_BADGE.ENTERPRISE,
                  },
                ].map((p) => (
                  <div
                    key={p.label}
                    className="bg-card rounded-xl border border-border px-5 py-4 flex items-center gap-3"
                  >
                    <span
                      className={cn(
                        "text-xs font-bold px-2.5 py-0.5 rounded-full border shrink-0",
                        p.badge
                      )}
                    >
                      {p.label}
                    </span>
                    <div>
                      <p className="text-xl font-bold text-foreground tabular-nums">{p.count}</p>
                      <p className="text-xs text-muted-foreground">
                        subscriber{p.count !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {plansHook.plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={cn(
                      "bg-card rounded-2xl border p-5 flex flex-col gap-4",
                      PLAN_CARD[plan.name] ?? "border-border"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={cn(
                              "text-xs font-bold px-2.5 py-0.5 rounded-full border",
                              PLAN_BADGE[plan.name] ?? PLAN_BADGE.FREE
                            )}
                          >
                            {plan.name}
                          </span>
                          {!plan.isActive && (
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              inactive
                            </span>
                          )}
                          {plan.isDefault && (
                            <span className="text-[10px] text-primary font-semibold">default</span>
                          )}
                        </div>
                        <p className="text-base font-semibold text-foreground mt-1.5">
                          {plan.displayName || plan.name}
                        </p>
                        {plan.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {plan.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-foreground tabular-nums">
                        ${plan.priceMonthly}
                      </span>
                      <span className="text-xs text-muted-foreground">/mo</span>
                      {plan.priceYearly > 0 && (
                        <span className="ml-2 text-xs text-success font-medium">
                          ${plan.priceYearly}/yr
                        </span>
                      )}
                    </div>
                    {plan.limits.length > 0 && (
                      <div className="flex-1 space-y-1.5 border-t border-border pt-3">
                        {plan.limits.slice(0, 8).map((l) => (
                          <div key={l.metric} className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {PLAN_LIMIT_LABELS[l.metric] ?? l.metric}
                            </span>
                            <span
                              className={cn(
                                "text-xs font-semibold tabular-nums",
                                l.value === -1 ? "text-success" : "text-foreground"
                              )}
                            >
                              {fmt(l.value)}
                            </span>
                          </div>
                        ))}
                        {plan.limits.length > 8 && (
                          <p className="text-[10px] text-muted-foreground">
                            +{plan.limits.length - 8} more limits
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ── ACCOUNTS VIEW ──────────────────────────────────────────────────── */}
      {view === "accounts" && (
        <>
          {/* Account stats summary */}
          {accountsHook.accounts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Accounts", value: accountStats.total, color: "text-foreground" },
                { label: "Active", value: accountStats.active, color: "text-success" },
                { label: "Trialing", value: accountStats.trialing, color: "text-primary" },
                { label: "Suspended", value: accountStats.suspended, color: "text-destructive" },
              ].map((s) => (
                <div key={s.label} className="bg-card rounded-xl border border-border px-4 py-3">
                  <p className={cn("text-xl font-bold tabular-nums", s.color)}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Filter row */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[180px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search email, name, or org…"
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="h-9 pl-7 pr-7 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
              >
                <option value="all">All plans</option>
                <option value="FREE">FREE</option>
                <option value="PRO">PRO</option>
                <option value="ENTERPRISE">ENTERPRISE</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
            </div>
            <div className="relative">
              <Activity className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 pl-7 pr-7 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="trialing">Trialing</option>
                <option value="suspended">Suspended</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
            </div>
            <span className="text-sm text-muted-foreground ml-auto">
              {filteredAccounts.length} account{filteredAccounts.length !== 1 ? "s" : ""}
            </span>
          </div>

          {accountsHook.error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" /> {accountsHook.error}
            </div>
          )}

          {accountsHook.loading && (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 rounded-xl bg-muted/40 animate-pulse border border-border"
                />
              ))}
            </div>
          )}

          {!accountsHook.loading && filteredAccounts.length === 0 && (
            <EmptyState
              icon={Users}
              title="No accounts found"
              description={
                searchQuery || planFilter !== "all" || statusFilter !== "all"
                  ? "No accounts matched your filters. Try adjusting your search."
                  : "No Notify accounts yet. Users appear here after they sign up."
              }
            />
          )}

          {filteredAccounts.length > 0 && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    {[
                      "User / Organisation",
                      "Account ID",
                      "Plan",
                      "Status",
                      "Joined",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredAccounts.map((acc) => {
                    const displayName =
                      (acc.orgName ?? `${acc.firstName ?? ""} ${acc.lastName ?? ""}`.trim()) ||
                      acc.userEmail;
                    return (
                      <tr key={acc.accountId} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              initials={displayName.slice(0, 2).toUpperCase()}
                              size="sm"
                            />
                            <div>
                              <p className="font-medium text-foreground leading-tight">
                                {displayName}
                              </p>
                              <p className="text-xs text-muted-foreground">{acc.userEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                            {acc.accountId.slice(0, 8)}…
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                              PLAN_BADGE[acc.plan] ?? PLAN_BADGE.FREE
                            )}
                          >
                            {acc.plan}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize border",
                              STATUS_BADGE[acc.status] ??
                                "text-muted-foreground bg-muted border-border"
                            )}
                          >
                            {acc.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {acc.createdAt
                            ? new Date(acc.createdAt).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setEditLimitsFor(acc)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted hover:border-primary/30 transition-colors"
                          >
                            <ShieldCheck className="h-3 w-3" /> Limits
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {editLimitsFor && (
        <LimitsModal
          account={editLimitsFor}
          token={token}
          onClose={() => setEditLimitsFor(undefined)}
        />
      )}
      {showAddUser && (
        <AddUserModal
          token={token}
          onClose={() => setShowAddUser(false)}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}

// ── Tab definitions ───────────────────────────────────────────────────────────
interface TabDef {
  id: string;
  label: string;
  icon: React.ElementType;
  products?: string[];
}

const TABS: TabDef[] = [
  { id: "overview", label: "Overview", icon: BarChart2 },
  { id: "customers", label: "Customers", icon: Users },
  { id: "tickets", label: "Support Tickets", icon: Ticket },
  { id: "plans-users", label: "Plans & Users", icon: ShieldCheck, products: ["notify"] },
  { id: "settings", label: "Settings", icon: Settings2 },
];

// ── Main ProductModule ────────────────────────────────────────────────────────
export default function ProductModule() {
  const { activeProductId, activeProductTab, setActiveProductTab, products, can, currentUser } =
    usePlatform();

  const product = products.find((p) => p.id === activeProductId);
  if (!product) return null;

  const Icon = PRODUCT_ICONS[product.id] ?? Package;
  const accent = PRODUCT_ACCENT[product.id] ?? PRODUCT_ACCENT["notify"];

  const MGMT_ROLES = new Set(["super_admin", "ops_manager", "product_manager", "support_lead"]);
  const canSeePlansUsers =
    MGMT_ROLES.has(currentUser.role) ||
    can("manage_products") ||
    can("configure_product") ||
    can("manage_users");

  const visibleTabs = TABS.filter((tab) => {
    if (tab.products && !tab.products.includes(product.id)) return false;
    if (tab.id === "plans-users" && !canSeePlansUsers) return false;
    if (tab.id === "settings" && !can("configure_product") && !can("view_products")) return false;
    return true;
  });

  const safeTab = visibleTabs.find((t) => t.id === activeProductTab)
    ? activeProductTab
    : (visibleTabs[0]?.id ?? "overview");

  const overviewContent: Record<string, React.ReactNode> = {
    notify: <NotifyOverview />,
    crm: <CrmOverview />,
    payments: <PaymentsOverview />,
    analytics: <AnalyticsOverview />,
  };

  const tabContent: Record<string, React.ReactNode> = {
    overview: overviewContent[product.id] ?? <NotifyOverview />,
    customers: <CustomersTab productId={product.id} />,
    tickets: <TicketsTab productId={product.id} />,
    "plans-users": <PlansUsersTab />,
    settings: <SettingsTab productId={product.id} />,
  };

  return (
    <div className="flex flex-col min-h-full animate-fade-in">
      {/* Top accent bar — product brand colour */}
      <div className={`h-0.5 w-full bg-gradient-to-r ${accent.bar}`} />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-7">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "w-13 h-13 rounded-2xl flex items-center justify-center border shrink-0 p-3",
                accent.ring
              )}
            >
              <Icon className={cn("h-6 w-6", accent.icon)} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {product.name}
                </h1>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border",
                    accent.badge
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      product.status === "Active"
                        ? accent.dot + " animate-pulse"
                        : "bg-muted-foreground"
                    )}
                  />
                  {product.status}
                </span>
                <span className="text-xs font-mono border border-border rounded px-2 py-0.5 text-muted-foreground bg-muted">
                  {product.code}
                </span>
              </div>
              {product.description && (
                <p className="text-sm text-muted-foreground mt-0.5">{product.description}</p>
              )}
              {/* Live KPI strip — Notify only */}
              {product.id === "notify" && currentUser.token && (
                <NotifyKpiStrip token={currentUser.token} />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 pt-0.5">
            <a
              href={`https://${product.id}.afrisinc.com/app`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open App
            </a>
          </div>
        </div>

        {/* ── Tab bar ──────────────────────────────────────────────────────── */}
        <div className="flex border-b border-border mb-6 overflow-x-auto">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveProductTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
                safeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab content ──────────────────────────────────────────────────── */}
        <div>{tabContent[safeTab] ?? tabContent["overview"]}</div>
      </div>
    </div>
  );
}
