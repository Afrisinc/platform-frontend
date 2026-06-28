import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ChevronDown, Wifi, WifiOff, ExternalLink } from "lucide-react";
import { TEAM_MEMBERS, ROLE_LABELS, SESSION_KEY } from "@/contexts/PlatformContext";
import { AUTH_UI_URL } from "@/lib/env";

/** Callback URL that auth-ui will redirect back to after a successful login. */
const CALLBACK_URL = `${window.location.origin}/auth/callback`;

/**
 * LoginPage — control.afrisinc.com/login
 *
 * Auth strategy (two-tier):
 *  1. SSO via Afrisinc auth-ui service
 *     Clicking "Sign in with Afrisinc Account" redirects the user to the central
 *     auth portal. After login the auth-service issues an authorization code and
 *     redirects back to /auth/callback, where AuthCallbackPage exchanges the code
 *     for a JWT and stores the session.
 *
 *  2. Seed / offline demo fallback
 *     If the auth-ui is unavailable or for local development, the collapsible
 *     "Demo accounts" panel lets engineers sign in as any seed role directly.
 */
export default function LoginPage() {
  const navigate = useNavigate();

  const [showHints, setShowHints] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [error, setError] = useState("");

  // ── SSO redirect ──────────────────────────────────────────────────────────
  function handleSSOLogin() {
    const loginUrl = `${AUTH_UI_URL}/login?redirect_uri=${encodeURIComponent(CALLBACK_URL)}`;
    window.location.href = loginUrl;
  }

  // ── Seed / demo fallback ──────────────────────────────────────────────────
  function selectDemoMember(email: string) {
    const member = TEAM_MEMBERS.find((m) => m.email.toLowerCase() === email.toLowerCase());
    if (!member) {
      setError("Demo account not found.");
      return;
    }
    if (member.status === "Inactive") {
      setError("This demo account is inactive.");
      return;
    }
    if (member.status === "Locked") {
      setError("This demo account is locked.");
      return;
    }

    const session = {
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      productAccess: member.productAccess,
      avatar: member.avatar,
      // No token — platform uses seed data for all lists in demo mode
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setDemoMode(true);
    navigate("/", { replace: true });
  }

  const activeMembers = TEAM_MEMBERS.filter((m) => m.status === "Active");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Subtle background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-sm space-y-4">
        {/* ── Main card ──────────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
          {/* Brand */}
          <div className="flex flex-col items-center mb-8">
            <img
              src="/afrisic-logo.png"
              alt="Afrisinc Logo"
              className="w-12 h-12 rounded-xl shadow-md mb-4"
            />
            <h1 className="text-xl font-bold tracking-tight text-foreground">Afrisinc Control</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your team account</p>
          </div>

          {/* Demo mode indicator */}
          {demoMode && (
            <div className="flex items-center gap-2 bg-warning/10 border border-warning/20 rounded-lg px-3 py-2 mb-4">
              <WifiOff className="h-3.5 w-3.5 text-warning shrink-0" />
              <p className="text-xs text-warning font-medium">Demo mode — using local seed data</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-lg mb-4">
              {error}
            </p>
          )}

          {/* Primary SSO button */}
          <button
            type="button"
            onClick={handleSSOLogin}
            className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold
                       flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
          >
            Sign in with Afrisinc Account
            <ExternalLink className="h-4 w-4 opacity-70" />
          </button>

          <div className="mt-4 flex items-center gap-2 text-muted-foreground">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs">or use a demo account below</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Auth mode indicator */}
          <div className="mt-4 flex items-center justify-center gap-1.5">
            <Wifi className="h-3 w-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Redirects to Afrisinc auth portal, returns here with a secure code
            </p>
          </div>

          {/* Security note */}
          <div className="mt-4 pt-4 border-t border-border flex items-start gap-2.5">
            <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sessions expire after 8 hours of inactivity. After 5 failed attempts your account is
              locked for 15 minutes.
            </p>
          </div>
        </div>

        {/* ── Demo credentials panel ──────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowHints((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <span>Demo accounts — click to sign in as any role</span>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${showHints ? "rotate-180" : ""}`}
            />
          </button>

          {showHints && (
            <div className="border-t border-border divide-y divide-border">
              {activeMembers.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => selectDemoMember(m.email)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 ml-3 shrink-0">
                    <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium border border-accent-foreground/10">
                      {ROLE_LABELS[m.role]}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {m.productAccess.length} product{m.productAccess.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </button>
              ))}
              <div className="px-4 py-2.5 bg-muted/30">
                <p className="text-xs text-muted-foreground">
                  Demo accounts use local data only — no backend required
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Afrisinc Control · Internal use only ·{" "}
          <span className="text-primary">control.afrisinc.com</span>
        </p>
      </div>
    </div>
  );
}
