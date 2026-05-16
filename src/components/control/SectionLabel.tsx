import { cn } from "@/lib/utils";

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * SectionLabel — Small uppercase tracking label used to introduce grouped
 * content within a card or section. Consistent across all pages.
 *
 * Usage:
 *   <SectionLabel>Workspace Overview</SectionLabel>
 */
export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
        className
      )}
    >
      {children}
    </p>
  );
}
