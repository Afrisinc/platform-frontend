import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Shield, ChevronDown, Wifi, WifiOff } from "lucide-react";
import { TEAM_MEMBERS, ROLE_LABELS, SESSION_KEY } from "@/contexts/PlatformContext";
import { loginWithBackend } from "@/lib/platformApi";

/**
 * LoginPage — control.afrisinc.com/login
 *
 * Auth strategy (two-tier):
 *  1. Real backend  — POST /auth/login → POST /oauth/exchange → GET /users/profile
 *     Stores the JWT token in the session so the platform can call authenticated endpoints.
 *
 *  2. Seed fallback — if the backend is unreachable or returns an error, fall back to
 *     matching the email against TEAM_MEMBERS seed data (any non-empty password accepted).
 *     A "Demo mode" badge appears so developers know which path was taken.
 */
export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [showHints, setShowHints]       = useState(false);
  const [demoMode, setDemoMode]         = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setDemoMode(false);

    if (!email.trim() || !password) {
      setError("Please enter your work email and password.");
      return;
    }

    setLoading(true);

    try {
      // ── Attempt 1: Real backend auth ────────────────────────────────────
      const backendResult = await loginWithBackend(email.trim(), password);

      if (backendResult) {
        // Backend auth succeeded — resolve role + productAccess from seed data by email
        // (the backend's org-member role lives in a separate DB query; seed is the bridge)
        const seedMember = TEAM_MEMBERS.find(
          (m) => m.email.toLowerCase() === email.trim().toLowerCase()
        );

        // Build full name from backend profile fields, fall back to seed / email
        const name =
          `${backendResult.firstName} ${backendResult.lastName}`.trim() ||
          seedMember?.name ||
          email.trim();

        const initials = name
          .split(" ")
          .filter(Boolean)
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        const session = {
          id:            backendResult.userId,
          name,
          email:         backendResult.email,
          role:          seedMember?.role          ?? "support_agent",
          productAccess: seedMember?.productAccess ?? [],
          avatar:        initials || seedMember?.avatar || "??",
          token:         backendResult.token, // JWT stored so platform can call authenticated APIs
        };

        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        navigate("/", { replace: true });
        return;
      }
    } catch {
      // Backend threw — fall through to seed auth
    }

    // ── Attempt 2: Seed data fallback (demo / offline mode) ─────────────
    const member = TEAM_MEMBERS.find(
      (m) => m.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!member) {
      setLoading(false);
      setError("No account found with that email address.");
      return;
    }

    if (member.status === "Inactive") {
      setLoading(false);
      setError("Your account is inactive. Contact your Super Admin to reactivate it.");
      return;
    }

    if (member.status === "Locked") {
      setLoading(false);
      setError("Your account is locked due to too many failed login attempts. Contact your Super Admin.");
      return;
    }

    // Simulate a network round-trip for UX consistency
    setTimeout(() => {
      const session = {
        id:            member.id,
        name:          member.name,
        email:         member.email,
        role:          member.role,
        productAccess: member.productAccess,
        avatar:        member.avatar,
        // No token — platform will use seed data for all lists
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setDemoMode(true);
      navigate("/", { replace: true });
    }, 600);
  }

  function selectHint(hintEmail: string) {
    setEmail(hintEmail);
    setPassword("demo1234");
    setShowHints(false);
    setError("");
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
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-md mb-4">
              <span className="text-primary-foreground font-bold text-xl leading-none">A</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Afrisinc Control</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your team account</p>
          </div>

          {/* Demo mode indicator */}
          {demoMode && (
            <div className="flex items-center gap-2 bg-warning/10 border border-warning/20 rounded-lg px-3 py-2 mb-4">
              <WifiOff className="h-3.5 w-3.5 text-warning shrink-0" />
              <p className="text-xs text-warning font-medium">
                Demo mode — backend unreachable, using local data
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Work Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@afrisinc.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm
                           placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring
                           focus:border-transparent transition-shadow"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <button type="button" className="text-xs text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-3 pr-10 rounded-lg border border-input bg-background text-foreground text-sm
                             placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring
                             focus:border-transparent transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold
                         flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Auth mode indicator */}
          <div className="mt-5 flex items-center justify-center gap-1.5">
            <Wifi className="h-3 w-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Tries live backend first, falls back to demo accounts
            </p>
          </div>

          {/* Security note */}
          <div className="mt-4 pt-4 border-t border-border flex items-start gap-2.5">
            <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sessions expire after 8 hours of inactivity. After 5 failed attempts your account is locked for 15 minutes.
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
                  onClick={() => selectHint(m.email)}
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
                  Password for all demo accounts:{" "}
                  <span className="font-mono font-medium text-foreground">demo1234</span>
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
