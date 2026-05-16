import { useState } from "react";
import { Search, Bell, ChevronDown, LogOut, User } from "lucide-react";
import { usePlatform, ROLE_LABELS } from "@/contexts/PlatformContext";
import { authService } from "@/services/authService";
import { UserAvatar } from "@/components/control/UserAvatar";
import { ThemeToggle } from "./ThemeToggle";

export function TopNavBar() {
  const { currentUser } = usePlatform();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  function handleSignOut() {
    authService.redirectToAuthUI();
  }

  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3 shrink-0 z-30">
      {/* ── Brand ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 mr-2 shrink-0">
        <img src="/afrisic-logo.png" alt="Afrisinc Logo" className="w-8 h-8 rounded-lg shadow-sm" />
        <div className="hidden sm:flex flex-col leading-none">
          <span className="font-bold text-sm tracking-tight text-foreground">Afrisinc</span>
          <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
            Control
          </span>
        </div>
      </div>

      <div className="h-5 w-px bg-border hidden sm:block" />

      {/* ── Active product badge ───────────────────────────────────── */}
      {currentUser.productAccess.length > 0 && (
        <div className="hidden md:flex items-center gap-2">
          {currentUser.productAccess.map((p) => (
            <div
              key={p}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent border border-accent-foreground/10"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="text-xs font-semibold text-accent-foreground capitalize">{p}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1" />

      {/* ── Global search ─────────────────────────────────────────── */}
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary hover:bg-muted transition-colors text-sm text-muted-foreground max-w-xs">
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden md:inline text-sm">Search customers, tickets…</span>
        <kbd className="hidden lg:inline-flex h-5 items-center rounded border border-border px-1.5 font-mono text-[10px] text-muted-foreground ml-1">
          ⌘K
        </kbd>
      </button>

      {/* ── Theme toggle ──────────────────────────────────────────── */}
      <ThemeToggle />

      {/* ── Notification bell ─────────────────────────────────────── */}
      <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
        <Bell className="h-4 w-4 text-muted-foreground" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full" />
      </button>

      {/* ── User menu ─────────────────────────────────────────────── */}
      <div className="relative">
        <button
          onClick={() => setUserMenuOpen((v) => !v)}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-secondary transition-colors"
        >
          <UserAvatar initials={currentUser.avatar} size="sm" />
          <div className="hidden sm:flex flex-col items-start leading-tight">
            <span className="text-xs font-semibold text-foreground">{currentUser.name}</span>
            <span className="text-[10px] text-muted-foreground">
              {ROLE_LABELS[currentUser.role]}
            </span>
          </div>
          <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
        </button>

        {userMenuOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-1 z-50 w-64 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
              {/* User info */}
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <UserAvatar initials={currentUser.avatar} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                  </div>
                </div>
                {/* Role badge */}
                <div className="mt-2.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent text-accent-foreground border border-accent-foreground/10">
                    <User className="h-3 w-3" />
                    {ROLE_LABELS[currentUser.role]}
                  </span>
                </div>
              </div>

              {/* Product access */}
              {currentUser.productAccess.length > 0 && (
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Product Access
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentUser.productAccess.map((p) => (
                      <span
                        key={p}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-success/10 text-success border border-success/20 font-medium capitalize"
                      >
                        <span className="w-1 h-1 rounded-full bg-success" />
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sign out */}
              <div className="p-2">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
