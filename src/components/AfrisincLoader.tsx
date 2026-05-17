import { cn } from "@/lib/utils";

interface AfrisincLoaderProps {
  message?: string;
  submessage?: string;
  className?: string;
}

export function AfrisincLoader({
  message = "Loading...",
  submessage,
  className,
}: AfrisincLoaderProps) {
  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center relative overflow-hidden",
        className
      )}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary-pale/30 animate-gradient" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-blob" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-primary-light/5 blur-3xl animate-blob animation-delay-2000" />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="animate-logo-pulse">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <span className="text-primary-foreground font-bold text-2xl">A</span>
          </div>
        </div>

        {/* Message */}
        <div className="text-center animate-fade-in-up animation-delay-300">
          <p className="text-lg font-semibold text-foreground">{message}</p>
          {submessage && <p className="text-sm text-muted-foreground mt-1">{submessage}</p>}
        </div>

        {/* Dots loader */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-dot-bounce" />
          <span className="w-2.5 h-2.5 rounded-full bg-primary-light animate-dot-bounce animation-delay-150" />
          <span className="w-2.5 h-2.5 rounded-full bg-primary-lighter animate-dot-bounce animation-delay-300" />
        </div>
      </div>
    </div>
  );
}
