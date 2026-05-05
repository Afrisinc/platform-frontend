import { BarChart3, TrendingUp, Users, Ticket, Download, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Legend,
} from "recharts";
import { usePlatform } from "@/contexts/PlatformContext";
import { PageHeader } from "@/components/control/PageHeader";
import { StatCard } from "@/components/control/StatCard";
import { SectionLabel } from "@/components/control/SectionLabel";
import { UserAvatar } from "@/components/control/UserAvatar";

// ── Chart data (representative mock) ─────────────────────────────────────────
const ticketVolumeData = [
  { day: "Mon", opened: 4, resolved: 3 },
  { day: "Tue", opened: 6, resolved: 5 },
  { day: "Wed", opened: 3, resolved: 6 },
  { day: "Thu", opened: 7, resolved: 4 },
  { day: "Fri", opened: 5, resolved: 7 },
  { day: "Sat", opened: 2, resolved: 2 },
  { day: "Sun", opened: 1, resolved: 3 },
];

const notifyDeliveryData = [
  { month: "Jan", email: 88, sms: 92, push: 78 },
  { month: "Feb", email: 91, sms: 89, push: 82 },
  { month: "Mar", email: 87, sms: 94, push: 85 },
  { month: "Apr", email: 93, sms: 91, push: 88 },
];

const resolutionData = [
  { label: "< 1 hour",  value: 3 },
  { label: "1–4 hours", value: 8 },
  { label: "4–24 hours",value: 5 },
  { label: "1–3 days",  value: 4 },
  { label: "> 3 days",  value: 1 },
];

const agentPerformance = [
  { name: "Fatou Diallo",   handled: 12, escalated: 1, avgHours: 3.2, satisfaction: 4.8 },
  { name: "Abena Boateng",  handled: 18, escalated: 2, avgHours: 2.1, satisfaction: 4.9 },
  { name: "Kwame Asante",   handled: 7,  escalated: 0, avgHours: 5.4, satisfaction: 4.7 },
];

// ── Tooltip style ─────────────────────────────────────────────────────────────
const TooltipStyle = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: 12,
    color: "hsl(var(--foreground))",
  },
  cursor: { fill: "hsl(var(--muted))" },
};

export default function ReportsPage() {
  const { can, tickets, customers } = usePlatform();
  const isReadOnly = !can("export_data");

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Read-only performance data across all assigned products."
      >
        {can("export_data") && (
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        )}
      </PageHeader>

      {/* Top-level stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Customers"   value={customers.length}                                             icon={Users}        changeType="positive" change="+3 this month"       iconBg="bg-primary/10"    iconColor="text-primary" />
        <StatCard label="Tickets This Week" value={tickets.length}                                               icon={Ticket}       changeType="neutral"  change="All statuses"       iconBg="bg-warning/10"    iconColor="text-warning" />
        <StatCard label="Avg. Resolution"   value="3.2h"                                                         icon={Clock}        changeType="positive" change="↓ 0.8h vs last wk"  iconBg="bg-success/10"    iconColor="text-success" />
        <StatCard label="Escalation Rate"   value={`${Math.round((tickets.filter(t => t.status === "Escalated").length / tickets.length) * 100)}%`} icon={AlertCircle} changeType="neutral" iconBg="bg-muted" iconColor="text-muted-foreground" />
      </div>

      {/* Ticket volume chart */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <SectionLabel>Ticket Volume — This Week</SectionLabel>
            <p className="text-xs text-muted-foreground mt-0.5">Opened vs resolved by day</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={ticketVolumeData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip {...TooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="opened"   name="Opened"   fill="hsl(var(--warning))"  radius={[4, 4, 0, 0]} opacity={0.85} />
            <Bar dataKey="resolved" name="Resolved" fill="hsl(var(--success))"  radius={[4, 4, 0, 0]} opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Notify delivery success */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="mb-6">
          <SectionLabel>Notify — Delivery Success Rate (%)</SectionLabel>
          <p className="text-xs text-muted-foreground mt-0.5">Email, SMS and push channels by month</p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={notifyDeliveryData}>
            <defs>
              <linearGradient id="emailGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="smsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(var(--success))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pushGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(var(--warning))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis domain={[70, 100]} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip {...TooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="email" name="Email" stroke="hsl(var(--primary))" fill="url(#emailGrad)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="sms"   name="SMS"   stroke="hsl(var(--success))" fill="url(#smsGrad)"  strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="push"  name="Push"  stroke="hsl(var(--warning))" fill="url(#pushGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resolution time */}
        <div className="bg-card rounded-xl border border-border p-6">
          <SectionLabel className="mb-1">Resolution Time Distribution</SectionLabel>
          <p className="text-xs text-muted-foreground mb-5">Number of tickets resolved in each time band</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={resolutionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="label" type="category" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip {...TooltipStyle} />
              <Bar dataKey="value" name="Tickets" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Agent performance */}
        <div className="bg-card rounded-xl border border-border p-6">
          <SectionLabel className="mb-4">Agent Performance</SectionLabel>
          <div className="space-y-4">
            {agentPerformance.map((agent) => (
              <div key={agent.name} className="flex items-start gap-3">
                <UserAvatar initials={agent.name.split(" ").map((n) => n[0]).join("")} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground">{agent.name}</p>
                    <span className="text-xs text-muted-foreground">⭐ {agent.satisfaction}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center bg-muted/40 rounded-md py-1.5">
                      <p className="text-sm font-bold text-foreground">{agent.handled}</p>
                      <p className="text-[10px] text-muted-foreground">Handled</p>
                    </div>
                    <div className="text-center bg-muted/40 rounded-md py-1.5">
                      <p className="text-sm font-bold text-foreground">{agent.avgHours}h</p>
                      <p className="text-[10px] text-muted-foreground">Avg. Time</p>
                    </div>
                    <div className="text-center bg-muted/40 rounded-md py-1.5">
                      <p className="text-sm font-bold text-foreground">{agent.escalated}</p>
                      <p className="text-[10px] text-muted-foreground">Escalated</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer health */}
      <div className="bg-card rounded-xl border border-border p-6">
        <SectionLabel className="mb-1">Customer Health</SectionLabel>
        <p className="text-xs text-muted-foreground mb-4">Accounts with repeated issues, low activity, or at risk</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Healthy",     count: customers.filter((c) => c.status === "Active" && (c.apiUsage ?? 0) > 1000).length,  color: "text-success",     bg: "bg-success/10",     desc: "Active, good API usage" },
            { label: "At Risk",     count: customers.filter((c) => c.status === "Active" && (c.apiUsage ?? 0) < 500).length,   color: "text-warning",     bg: "bg-warning/10",     desc: "Low recent activity" },
            { label: "Suspended",   count: customers.filter((c) => c.status === "Suspended").length,                           color: "text-destructive", bg: "bg-destructive/10", desc: "Account suspended" },
          ].map((item) => (
            <div key={item.label} className={`rounded-lg px-4 py-4 ${item.bg} border border-current/10`}>
              <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
              <p className={`text-sm font-semibold ${item.color} mt-0.5`}>{item.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
