import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Lock,
  User,
  Package,
  Ticket,
  Key,
  CreditCard,
  Shield,
  MonitorSmartphone,
} from "lucide-react";
import { usePlatform, AuditEvent, AuditEntityType } from "@/contexts/PlatformContext";
import { PageHeader } from "@/components/control/PageHeader";
import { SectionLabel } from "@/components/control/SectionLabel";
import { EmptyState } from "@/components/control/EmptyState";
import { UserAvatar } from "@/components/control/UserAvatar";

// ── Entity type icon map ────────────────────────────────────────────────────────
const ENTITY_ICONS: Record<AuditEntityType, React.ElementType> = {
  user: User,
  product: Package,
  ticket: Ticket,
  customer: User,
  api_key: Key,
  billing: CreditCard,
  role: Shield,
  session: MonitorSmartphone,
};

const ENTITY_COLORS: Record<AuditEntityType, string> = {
  user: "bg-primary/10 text-primary",
  product: "bg-success/10 text-success",
  ticket: "bg-warning/10 text-warning",
  customer: "bg-accent text-accent-foreground",
  api_key: "bg-muted text-muted-foreground",
  billing: "bg-warning/10 text-warning",
  role: "bg-destructive/10 text-destructive",
  session: "bg-muted text-muted-foreground",
};

const ENTITY_LABELS: Record<AuditEntityType, string> = {
  user: "User",
  product: "Product",
  ticket: "Ticket",
  customer: "Customer",
  api_key: "API Key",
  billing: "Billing",
  role: "Role",
  session: "Session",
};

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AuditLogPage() {
  const { auditLog, can } = usePlatform();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  const filtered = auditLog.filter((e) => {
    const matchSearch =
      !search ||
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.userName.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || e.entityType === typeFilter;
    return matchSearch && matchType;
  });

  const entityTypes = Array.from(new Set(auditLog.map((e) => e.entityType)));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Audit Log"
        subtitle="Append-only record of every meaningful action in the platform. Cannot be deleted or modified."
      >
        {can("export_data") && (
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        )}
      </PageHeader>

      {/* Immutability notice */}
      <div className="flex items-start gap-3 bg-muted/50 border border-border rounded-xl px-4 py-3.5">
        <Lock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-sm text-muted-foreground">
          The audit log is <strong className="text-foreground">append-only</strong>. No one —
          including Super Admin — can edit or delete entries. Every permission change, login, and
          ticket action is recorded here.
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by action, user, or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <button
              onClick={() => setTypeFilter("All")}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${typeFilter === "All" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              All
            </button>
            {entityTypes.map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(typeFilter === type ? "All" : type)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${typeFilter === type ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              >
                {ENTITY_LABELS[type as AuditEntityType]}
              </button>
            ))}
          </div>
        </div>

        {/* Log entries */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No log entries match your search."
            description="Try adjusting the filters or search term."
          />
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((event) => {
              const Icon = ENTITY_ICONS[event.entityType];
              const colorClass = ENTITY_COLORS[event.entityType];
              const initials = event.userName
                .split(" ")
                .map((n) => n[0])
                .join("");

              return (
                <div
                  key={event.id}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition-colors"
                >
                  {/* Entity type icon */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${colorClass}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">{event.action}</p>
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${colorClass}`}
                          >
                            {ENTITY_LABELS[event.entityType]}
                          </span>
                          {event.productId && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-accent text-accent-foreground">
                              Notify
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 leading-snug">
                          {event.description}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 pt-0.5">
                        {formatTimestamp(event.timestamp)}
                      </span>
                    </div>

                    {/* Actor + IP */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1.5">
                        <UserAvatar initials={initials} size="sm" />
                        <span className="text-xs text-muted-foreground">{event.userName}</span>
                      </div>
                      {event.ip && (
                        <>
                          <span className="text-muted-foreground/40">·</span>
                          <span className="text-xs font-mono text-muted-foreground">
                            {event.ip}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing {filtered.length} of {auditLog.length} events
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
