import { useState } from "react";
import {
  BarChart2, Users, Ticket, Settings2,
  Bell, Layers, CreditCard, BarChart3,
  Package, ExternalLink, AlertTriangle, CheckCircle2,
  Mail, MessageSquare, Save, ToggleLeft, ToggleRight,
  TrendingUp, DollarSign, Zap, FileBarChart,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { usePlatform } from "@/contexts/PlatformContext";
import { SectionLabel } from "@/components/control/SectionLabel";
import { StatCard } from "@/components/control/StatCard";
import { StatusBadge } from "@/components/control/StatusBadge";
import { EmptyState } from "@/components/control/EmptyState";
import { UserAvatar } from "@/components/control/UserAvatar";

// ── Product icon + accent maps ────────────────────────────────────────────────
const PRODUCT_ICONS: Record<string, React.ElementType> = {
  notify:    Bell,
  crm:       Layers,
  payments:  CreditCard,
  analytics: BarChart3,
};

const PRODUCT_ACCENT: Record<string, { icon: string; dot: string; ring: string }> = {
  notify:    { icon: "text-primary",            dot: "bg-primary",   ring: "bg-primary/10 border-primary/20" },
  crm:       { icon: "text-success",            dot: "bg-success",   ring: "bg-success/10 border-success/20" },
  payments:  { icon: "text-warning",            dot: "bg-warning",   ring: "bg-warning/10 border-warning/20" },
  analytics: { icon: "text-muted-foreground",   dot: "bg-accent-foreground/40", ring: "bg-muted border-border" },
};

// ── Shared chart tooltip style ────────────────────────────────────────────────
const TooltipStyle = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: 12,
    color: "hsl(var(--foreground))",
  },
};

// ── Per-product overview data ─────────────────────────────────────────────────

// Notify overview
const notifyDeliveryData = [
  { date: "Apr 19", email: 1240, sms: 890,  push: 320 },
  { date: "Apr 20", email: 1580, sms: 1020, push: 410 },
  { date: "Apr 21", email: 1320, sms: 940,  push: 290 },
  { date: "Apr 22", email: 1740, sms: 1180, push: 520 },
  { date: "Apr 23", email: 1420, sms: 1050, push: 380 },
  { date: "Apr 24", email: 1890, sms: 1290, push: 610 },
  { date: "Apr 25", email: 2100, sms: 1380, push: 680 },
];
const notifyErrorData = [
  { date: "Apr 19", rate: 1.2 },
  { date: "Apr 20", rate: 0.9 },
  { date: "Apr 21", rate: 2.1 },
  { date: "Apr 22", rate: 0.8 },
  { date: "Apr 23", rate: 1.1 },
  { date: "Apr 24", rate: 0.6 },
  { date: "Apr 25", rate: 0.7 },
];

// CRM overview
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
  { stage: "Prospect",    deals: 42 },
  { stage: "Qualified",   deals: 28 },
  { stage: "Proposal",    deals: 17 },
  { stage: "Negotiation", deals: 9 },
  { stage: "Won",         deals: 24 },
];

// Payments overview
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

// Analytics overview
const analyticsReports = [
  { date: "Apr 19", runs: 34 },
  { date: "Apr 20", runs: 41 },
  { date: "Apr 21", runs: 28 },
  { date: "Apr 22", runs: 52 },
  { date: "Apr 23", runs: 38 },
  { date: "Apr 24", runs: 61 },
  { date: "Apr 25", runs: 47 },
];

// ── Overview components per product ──────────────────────────────────────────

function NotifyOverview() {
  const { customers, tickets } = usePlatform();
  const notifyTickets = tickets.filter((t) => t.productId === "notify");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Customers" value={customers.filter((c) => c.status === "Active" && c.products.includes("notify")).length} icon={Users}         changeType="positive" change="+2 this month"      iconBg="bg-primary/10"  iconColor="text-primary" />
        <StatCard label="API Calls Today"  value="8,420"                                                                                   icon={Zap}           changeType="positive" change="+5.3% vs yesterday" iconBg="bg-success/10"  iconColor="text-success" />
        <StatCard label="Open Tickets"     value={notifyTickets.filter((t) => t.status === "Open").length}                                  icon={Ticket}        changeType="neutral"                              iconBg="bg-warning/10"  iconColor="text-warning" />
        <StatCard label="Error Rate"       value="0.7%"                                                                                    icon={AlertTriangle} changeType="positive" change="↓ 0.1% vs yesterday" iconBg="bg-muted"       iconColor="text-muted-foreground" />
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <SectionLabel className="mb-1">Delivery Volume — Last 7 Days</SectionLabel>
        <p className="text-xs text-muted-foreground mt-0.5 mb-5">Notifications sent across email, SMS and push</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={notifyDeliveryData}>
            <defs>
              <linearGradient id="emailG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="smsG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(var(--success))" stopOpacity={0.25} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip {...TooltipStyle} />
            <Area type="monotone" dataKey="email" name="Email" stroke="hsl(var(--primary))" fill="url(#emailG)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="sms"   name="SMS"   stroke="hsl(var(--success))" fill="url(#smsG)"  strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <SectionLabel className="mb-1">Error Rate (%)</SectionLabel>
          <p className="text-xs text-muted-foreground mb-4">Delivery failures as % of total sends</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={notifyErrorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip {...TooltipStyle} />
              <Bar dataKey="rate" name="Error Rate" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <SectionLabel className="mb-4">Channel Usage</SectionLabel>
          <div className="space-y-3">
            {[
              { label: "Email", icon: Mail,          pct: 58, color: "bg-primary", value: "48.2K" },
              { label: "SMS",   icon: MessageSquare,  pct: 34, color: "bg-success", value: "28.3K" },
              { label: "Push",  icon: Bell,           pct: 8,  color: "bg-warning", value: "6.7K"  },
            ].map((ch) => (
              <div key={ch.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <ch.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm text-foreground">{ch.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{ch.value}</span>
                    <span className="text-sm font-semibold text-foreground">{ch.pct}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${ch.color}`} style={{ width: `${ch.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent events */}
      <div className="bg-card rounded-xl border border-border p-6">
        <SectionLabel className="mb-4">Recent Events</SectionLabel>
        <div className="space-y-2.5">
          {[
            { time: "2 min ago",   msg: "2,100 email notifications delivered to TechCorp Ghana batch",          ok: true  },
            { time: "18 min ago",  msg: "SMS delivery failure — TradeX Nigeria (1 of 340 failed)",              ok: false },
            { time: "1 hour ago",  msg: "Webhook delivery confirmed — FinPay Solutions",                        ok: true  },
            { time: "3 hours ago", msg: "Bounce rate spike detected for .ng domains — auto-throttled",          ok: false },
            { time: "5 hours ago", msg: "New API key generated for PayStack Partners",                          ok: true  },
          ].map((ev, i) => (
            <div key={i} className="flex items-center gap-3">
              {ev.ok
                ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                : <AlertTriangle className="h-4 w-4 text-warning shrink-0" />}
              <p className="text-sm text-foreground flex-1">{ev.msg}</p>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{ev.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CrmOverview() {
  const { customers, tickets } = usePlatform();
  const crmTickets = tickets.filter((t) => t.productId === "crm");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Contacts"  value="2,140"                                                                            icon={Users}       changeType="positive" change="+60 this week"  iconBg="bg-success/10" iconColor="text-success" />
        <StatCard label="Active Deals"    value="96"                                                                               icon={TrendingUp}  changeType="positive" change="+8 vs last week" iconBg="bg-primary/10" iconColor="text-primary" />
        <StatCard label="Open Tickets"    value={crmTickets.filter((t) => t.status !== "Resolved").length}                         icon={Ticket}      changeType="neutral"                           iconBg="bg-warning/10" iconColor="text-warning" />
        <StatCard label="Conversion Rate" value="24.8%"                                                                            icon={BarChart3}   changeType="positive" change="+1.2% this month" iconBg="bg-muted"     iconColor="text-muted-foreground" />
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <SectionLabel className="mb-1">Contact Growth — Last 7 Days</SectionLabel>
        <p className="text-xs text-muted-foreground mt-0.5 mb-5">Total contacts in the CRM</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={crmContactGrowth}>
            <defs>
              <linearGradient id="crmG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(var(--success))" stopOpacity={0.25} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="date"     tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis dataKey="contacts" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
            <Tooltip {...TooltipStyle} />
            <Area type="monotone" dataKey="contacts" name="Contacts" stroke="hsl(var(--success))" fill="url(#crmG)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <SectionLabel className="mb-4">Deal Pipeline by Stage</SectionLabel>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={crmPipelineData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={80} />
            <Tooltip {...TooltipStyle} />
            <Bar dataKey="deals" name="Deals" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <SectionLabel className="mb-4">Recent Activity</SectionLabel>
        <div className="space-y-2.5">
          {[
            { time: "10 min ago",  msg: "New contact added — TradeX Nigeria (Ibrahim Sule)", ok: true  },
            { time: "1 hour ago",  msg: "Deal moved to Proposal — Buildr Africa ($18K)", ok: true  },
            { time: "3 hours ago", msg: "Import failed — duplicate contacts detected from CSV", ok: false },
            { time: "5 hours ago", msg: "Pipeline automation triggered — 3 deals auto-advanced", ok: true  },
            { time: "1 day ago",   msg: "Stage automation not firing — ticket raised (TKT-009)", ok: false },
          ].map((ev, i) => (
            <div key={i} className="flex items-center gap-3">
              {ev.ok
                ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                : <AlertTriangle className="h-4 w-4 text-warning shrink-0" />}
              <p className="text-sm text-foreground flex-1">{ev.msg}</p>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{ev.time}</span>
            </div>
          ))}
        </div>
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
        <StatCard label="Revenue Today"      value="$138.2K"                                                                  icon={DollarSign}  changeType="positive" change="+10.8% vs yesterday" iconBg="bg-warning/10"  iconColor="text-warning" />
        <StatCard label="Transactions"       value="1,284"                                                                    icon={CreditCard}  changeType="positive" change="+92 vs yesterday"   iconBg="bg-primary/10"  iconColor="text-primary" />
        <StatCard label="Open Tickets"       value={payTickets.filter((t) => t.status !== "Resolved").length}                 icon={Ticket}      changeType="neutral"                              iconBg="bg-muted"       iconColor="text-muted-foreground" />
        <StatCard label="Success Rate"       value="98.7%"                                                                    icon={CheckCircle2}changeType="positive" change="↑ 0.4% vs yesterday" iconBg="bg-success/10" iconColor="text-success" />
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <SectionLabel className="mb-1">Transaction Volume — Last 7 Days</SectionLabel>
        <p className="text-xs text-muted-foreground mt-0.5 mb-5">Total USD processed per day</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={paymentsVolume}>
            <defs>
              <linearGradient id="payG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(var(--warning))" stopOpacity={0.25} />
                <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
            <Tooltip {...TooltipStyle} formatter={(v: number) => [`$${v.toLocaleString()}`, "Volume"]} />
            <Area type="monotone" dataKey="volume" name="Volume" stroke="hsl(var(--warning))" fill="url(#payG)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <SectionLabel className="mb-1">Success Rate (%)</SectionLabel>
        <p className="text-xs text-muted-foreground mb-4">Successful transactions as % of total</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={paymentsSuccess}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} unit="%" domain={[94, 100]} />
            <Tooltip {...TooltipStyle} />
            <Bar dataKey="rate" name="Success Rate" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <SectionLabel className="mb-4">Recent Events</SectionLabel>
        <div className="space-y-2.5">
          {[
            { time: "5 min ago",   msg: "Payout batch processed — FinPay Solutions ($42K)",              ok: true  },
            { time: "40 min ago",  msg: "Payout webhook not triggering — escalated (TKT-011)",           ok: false },
            { time: "2 hours ago", msg: "Invoice PDF generated for PayStack Partners — 48 invoices",     ok: true  },
            { time: "6 hours ago", msg: "March reconciliation mismatch — 3 transactions flagged",        ok: false },
            { time: "1 day ago",   msg: "Subscription renewal processed — TradeX Nigeria ($8K/mo)",      ok: true  },
          ].map((ev, i) => (
            <div key={i} className="flex items-center gap-3">
              {ev.ok
                ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                : <AlertTriangle className="h-4 w-4 text-warning shrink-0" />}
              <p className="text-sm text-foreground flex-1">{ev.msg}</p>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{ev.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsOverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Reports Run Today" value="47"     icon={FileBarChart} changeType="positive" change="+9 vs yesterday"  iconBg="bg-muted" iconColor="text-muted-foreground" />
        <StatCard label="Active Dashboards" value="12"     icon={BarChart3}    changeType="neutral"                            iconBg="bg-muted" iconColor="text-muted-foreground" />
        <StatCard label="Data Exports"      value="8"      icon={TrendingUp}   changeType="neutral"                            iconBg="bg-muted" iconColor="text-muted-foreground" />
        <StatCard label="Alerts Fired"      value="3"      icon={AlertTriangle}changeType="neutral"                            iconBg="bg-muted" iconColor="text-muted-foreground" />
      </div>

      <div className="flex items-center gap-3 bg-warning/10 border border-warning/20 rounded-xl px-5 py-4">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">Product in Beta</p>
          <p className="text-sm text-muted-foreground">Analytics is currently in closed beta. Some features may be unavailable.</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <SectionLabel className="mb-1">Report Runs — Last 7 Days</SectionLabel>
        <p className="text-xs text-muted-foreground mt-0.5 mb-5">Scheduled and manual report executions</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={analyticsReports}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip {...TooltipStyle} />
            <Bar dataKey="runs" name="Reports" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.6} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Customers tab (shared, filtered by productId) ─────────────────────────────
function CustomersTab({ productId }: { productId: string }) {
  const { customers } = usePlatform();
  const productCustomers = customers.filter((c) => c.products.includes(productId));

  if (productCustomers.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No customers yet"
        description={`No customers are currently using this product.`}
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {productCustomers.length} customer{productCustomers.length !== 1 ? "s" : ""} using this product.
      </p>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40">
              {["Customer", "Company", "API Calls", "Status", "Last Active"].map((col) => (
                <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {productCustomers.map((c) => (
              <tr key={c.id} className="hover:bg-muted/20 transition-colors cursor-pointer">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar initials={c.name.split(" ").map((n) => n[0]).join("")} size="sm" />
                    <div>
                      <p className="font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.company}</td>
                <td className="px-4 py-3 font-mono text-xs">{(c.apiUsage ?? 0).toLocaleString()}</td>
                <td className="px-4 py-3"><StatusBadge label={c.status} variant="account" /></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{c.lastActivity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tickets tab (shared, filtered by productId) ───────────────────────────────
function TicketsTab({ productId }: { productId: string }) {
  const { tickets } = usePlatform();
  const productTickets = tickets.filter((t) => t.productId === productId);
  const open           = productTickets.filter((t) => t.status !== "Resolved");
  const resolved       = productTickets.filter((t) => t.status === "Resolved");

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {open.length} active · {resolved.length} resolved
      </p>
      {open.length === 0 ? (
        <EmptyState icon={CheckCircle2} title="Queue is clear" description="No open tickets for this product." />
      ) : (
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          {open.map((t) => (
            <div key={t.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors cursor-pointer">
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

// ── Settings tab (shared) ─────────────────────────────────────────────────────
function SettingsTab({ productId }: { productId: string }) {
  const { can, products } = usePlatform();
  const canConfigure = can("configure_product");
  const product = products.find((p) => p.id === productId);

  return (
    <div className="space-y-5">
      {!canConfigure && (
        <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm text-muted-foreground">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          You have read-only access to product settings.
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
            className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-shadow"
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
          <p className="text-xs text-muted-foreground mt-1.5">Product codes cannot be changed after creation.</p>
        </div>

        <div className="border-t border-border pt-5">
          <SectionLabel className="mb-3">Feature Toggles</SectionLabel>
          <div className="space-y-3">
            {[
              { label: "Public API access",      desc: "Allow customers to call this product's API",    enabled: true  },
              { label: "Webhook events",          desc: "Emit webhook events on key state changes",      enabled: true  },
              { label: "Sandbox / test mode",     desc: "Enable a sandbox environment for developers",   enabled: false },
            ].map((feat) => (
              <div key={feat.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{feat.label}</p>
                  <p className="text-xs text-muted-foreground">{feat.desc}</p>
                </div>
                <button disabled={!canConfigure}>
                  {feat.enabled
                    ? <ToggleRight className={`h-6 w-6 ${canConfigure ? "text-primary" : "text-muted-foreground"}`} />
                    : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
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
          <p className="text-xs text-muted-foreground">API keys, rate limits, webhooks, integrations</p>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </a>
    </div>
  );
}

// ── Sub-tab config ─────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview",  label: "Overview",        icon: BarChart2  },
  { id: "customers", label: "Customers",       icon: Users      },
  { id: "tickets",   label: "Support Tickets", icon: Ticket     },
  { id: "settings",  label: "Settings",        icon: Settings2  },
];

// ── Main ProductModule export ─────────────────────────────────────────────────
export default function ProductModule() {
  const { activeProductId, activeProductTab, setActiveProductTab, products, can } = usePlatform();

  const product = products.find((p) => p.id === activeProductId);
  if (!product) return null;

  const Icon   = PRODUCT_ICONS[product.id] ?? Package;
  const accent = PRODUCT_ACCENT[product.id] ?? PRODUCT_ACCENT["notify"];

  const visibleTabs = TABS.filter((tab) => {
    // Hide Settings tab if the user has no access to tickets AND no configure permission
    if (tab.id === "settings" && !can("view_tickets") && !can("configure_product")) return false;
    return true;
  });

  const overviewContent: Record<string, React.ReactNode> = {
    notify:    <NotifyOverview />,
    crm:       <CrmOverview />,
    payments:  <PaymentsOverview />,
    analytics: <AnalyticsOverview />,
  };

  const tabContent: Record<string, React.ReactNode> = {
    overview:  overviewContent[product.id] ?? <NotifyOverview />,
    customers: <CustomersTab productId={product.id} />,
    tickets:   <TicketsTab   productId={product.id} />,
    settings:  <SettingsTab  productId={product.id} />,
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent.ring.split(" ")[0]}`}>
            <Icon className={`h-5 w-5 ${accent.icon}`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{product.name}</h1>
            <p className="text-sm text-muted-foreground">{product.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${accent.ring}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${product.status === "Active" ? `${accent.dot} animate-pulse` : "bg-muted-foreground"}`} />
            <span className={`text-xs font-semibold ${product.status === "Active" ? accent.icon : "text-muted-foreground"}`}>
              {product.status}
            </span>
          </div>
          {/* Product code */}
          <span className="text-xs font-mono border border-border rounded px-2 py-1 text-muted-foreground bg-muted">
            {product.code}
          </span>
          {/* External link */}
          <a
            href={`https://${product.id}.afrisinc.com/app`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Open App
          </a>
        </div>
      </div>

      {/* Sub-tab bar */}
      <div className="flex gap-1 border-b border-border">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveProductTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeProductTab === tab.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>{tabContent[activeProductTab] ?? tabContent["overview"]}</div>
    </div>
  );
}
