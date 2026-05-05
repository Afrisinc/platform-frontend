import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode; // action slot — buttons, badges, etc.
  className?: string;
}

/**
 * PageHeader — Consistent page-level title block used across every page.
 * Place at the top of every page before content. Children render on the right as actions.
 *
 * Usage:
 *   <PageHeader title="User Management" subtitle="Manage team members and roles.">
 *     <Button>Add User</Button>
 *   </PageHeader>
 */
export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 shrink-0">{children}</div>
      )}
    </div>
  );
}
