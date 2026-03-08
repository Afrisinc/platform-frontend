import { Search, Bell, ChevronDown } from "lucide-react";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { ProductSwitcher } from "./ProductSwitcher";

export function TopNavBar() {
  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-2 shrink-0 z-30">
      {/* Left: Logo */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">A</span>
        </div>
        <span className="font-bold text-lg tracking-tight hidden sm:inline">Afrisinc</span>
      </div>

      <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

      {/* Switchers */}
      <WorkspaceSwitcher />
      <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
      <ProductSwitcher />

      <div className="flex-1" />

      {/* Right */}
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary hover:bg-muted transition-colors text-sm text-muted-foreground">
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">Search...</span>
        <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-border px-1.5 font-mono text-[10px] text-muted-foreground">⌘K</kbd>
      </button>

      <ThemeToggle />

      <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
        <Bell className="h-4.5 w-4.5 text-muted-foreground" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
      </button>

      <button className="flex items-center gap-2 pl-2">
        <div className="w-8 h-8 rounded-full bg-primary-pale flex items-center justify-center">
          <span className="text-primary text-xs font-bold">JD</span>
        </div>
        <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
      </button>
    </header>
  );
}
