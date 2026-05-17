import { cn } from "@/lib/utils";

// ── Ticket status ────────────────────────────────────────────────────────────
const TICKET_STATUS_STYLES: Record<string, string> = {
  Open: "bg-primary/10 text-primary border-primary/20",
  "In Progress": "bg-warning/10 text-warning border-warning/20",
  "Waiting on Customer": "bg-muted text-muted-foreground border-border",
  Escalated: "bg-destructive/10 text-destructive border-destructive/20",
  Resolved: "bg-success/10 text-success border-success/20",
};

// ── Ticket priority ──────────────────────────────────────────────────────────
const TICKET_PRIORITY_STYLES: Record<string, string> = {
  Low: "bg-muted text-muted-foreground border-border",
  Medium: "bg-warning/10 text-warning border-warning/20",
  High: "bg-destructive/10 text-destructive border-destructive/20",
  Critical: "bg-destructive text-destructive-foreground border-destructive",
};

// ── Customer / user status ────────────────────────────────────────────────────
const ACCOUNT_STATUS_STYLES: Record<string, string> = {
  Active: "bg-success/10 text-success border-success/20",
  Inactive: "bg-muted text-muted-foreground border-border",
  Suspended: "bg-destructive/10 text-destructive border-destructive/20",
  Locked: "bg-destructive/10 text-destructive border-destructive/20",
  Pending: "bg-warning/10 text-warning border-warning/20",
};

// ── Product status ────────────────────────────────────────────────────────────
const PRODUCT_STATUS_STYLES: Record<string, string> = {
  Active: "bg-success/10 text-success border-success/20",
  Inactive: "bg-muted text-muted-foreground border-border",
};

type BadgeVariant = "ticket-status" | "ticket-priority" | "account" | "product";

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

/**
 * StatusBadge — Consistent colored pill badge for status/priority fields.
 * Automatically resolves the correct colour for the given label + variant.
 *
 * Usage:
 *   <StatusBadge label="Open" variant="ticket-status" />
 *   <StatusBadge label="Critical" variant="ticket-priority" />
 *   <StatusBadge label="Active" variant="account" />
 */
export function StatusBadge({ label, variant = "account", className }: StatusBadgeProps) {
  const styleMap =
    variant === "ticket-status"
      ? TICKET_STATUS_STYLES
      : variant === "ticket-priority"
        ? TICKET_PRIORITY_STYLES
        : variant === "product"
          ? PRODUCT_STATUS_STYLES
          : ACCOUNT_STATUS_STYLES;

  const style = styleMap[label] ?? "bg-muted text-muted-foreground border-border";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        style,
        className
      )}
    >
      {label}
    </span>
  );
}
