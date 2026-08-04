import { API_BASE } from "@/lib/api";
import { AUTH_UI_URL } from "@/lib/env";
import { SESSION_KEY } from "@/contexts/PlatformContext";
import type { ControlRole } from "@/contexts/PlatformContext";

// ── Response types ────────────────────────────────────────────────────────────

interface ExchangeResponse {
  token: string;
  token_type: string;
  expires_in: number;
  user_id: string;
  email: string;
  account_ids: string[];
  role_id?: string;
  role?: string;
}

interface UserProfileResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

// ── Session shape stored in localStorage ─────────────────────────────────────

export interface AuthSession {
  id: string;
  name: string;
  email: string;
  role: ControlRole;
  /** Backend role UUID — allows direct sidebar fetch without an extra name-lookup round-trip. */
  role_id?: string;
  productAccess: string[];
  avatar: string;
  /** JWT used for all authenticated API calls. */
  token: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function normalizeRole(role?: string): ControlRole {
  if (!role) return "support_agent";
  return role.toLowerCase().replace(/\s+/g, "_") as ControlRole;
}

// ── Auth service ──────────────────────────────────────────────────────────────

export const authService = {
  /**
   * Exchange an authorization code (from the SSO callback URL) for a JWT.
   * Immediately fetches the user profile for display name.
   * Returns a complete AuthSession ready to be stored.
   */
  async exchangeCode(code: string): Promise<AuthSession> {
    const res = await fetch(`${API_BASE}/auth/oauth/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any)?.resp_msg ?? "Token exchange failed");
    }

    const json = await res.json();
    const data: ExchangeResponse = json.data ?? json;

    if (!data.token || !data.user_id) {
      throw new Error("Invalid exchange response — missing token or user_id");
    }

    // Fetch user profile for display name (best-effort — session still succeeds without it)
    let firstName = "";
    let lastName = "";
    try {
      const profileRes = await fetch(`${API_BASE}/auth/users/profile`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      if (profileRes.ok) {
        const profileJson = await profileRes.json();
        const profile: UserProfileResponse = profileJson.data ?? profileJson;
        firstName = profile.firstName ?? "";
        lastName = profile.lastName ?? "";
      }
    } catch {
      // Intentionally swallowed — name falls back to email
    }

    const name = `${firstName} ${lastName}`.trim() || data.email;

    return {
      id: data.user_id,
      name,
      email: data.email,
      role: normalizeRole(data.role),
      role_id: data.role_id,
      productAccess: [],
      avatar: buildInitials(name),
      token: data.token,
    };
  },

  /** Persist the session to localStorage under the platform SESSION_KEY. */
  storeSession(session: AuthSession): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  /** Read the current session. Returns null if absent or malformed. */
  getSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AuthSession) : null;
    } catch {
      return null;
    }
  },

  /** Remove the session (logout). */
  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  /** True if a session record exists in localStorage. */
  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem(SESSION_KEY));
  },

  /**
   * Clear session and redirect the browser to the auth-ui login page.
   * The auth-ui will redirect back to /auth/callback after successful login.
   */
  redirectToAuthUI(): void {
    this.clearSession();
    const callbackUrl = `${window.location.origin}/auth/callback`;
    window.location.href = `${AUTH_UI_URL}/login?redirect_uri=${encodeURIComponent(callbackUrl)}`;
  },
};
