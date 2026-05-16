import { cn } from "@/lib/utils";

interface UserAvatarProps {
  initials: string;
  size?: "sm" | "md" | "lg";
  /** Optional extra className for the container */
  className?: string;
}

const SIZE_CLASSES = {
  sm: "w-7 h-7 text-[10px]",
  md: "w-8 h-8 text-xs",
  lg: "w-10 h-10 text-sm",
};

/**
 * UserAvatar — Consistent circular avatar displaying 2-letter initials.
 * Used across the sidebar, TopNavBar, team member lists, and ticket cards.
 *
 * Usage:
 *   <UserAvatar initials="KM" size="md" />
 */
export function UserAvatar({ initials, size = "md", className }: UserAvatarProps) {
  return (
    <div
      className={cn(
        "rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0",
        SIZE_CLASSES[size],
        className
      )}
    >
      <span className="font-bold text-primary leading-none">{initials}</span>
    </div>
  );
}
