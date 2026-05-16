/**
 * Low-level API client for the Afrisinc platform.
 * Routes through the API Gateway — set VITE_API_URL in .env.
 * All higher-level calls live in platformApi.ts.
 */

/** API Gateway base URL — set VITE_API_URL in .env, defaults to gateway port. */
export const API_BASE: string = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:8091";

/** Pull JWT from the stored session (written by LoginPage after a real backend auth). */
export function getStoredToken(): string | null {
  try {
    const raw = localStorage.getItem("ac_session");
    if (!raw) return null;
    const session = JSON.parse(raw) as { token?: string };
    return session.token ?? null;
  } catch {
    return null;
  }
}

/** Standard envelope returned by every backend endpoint. */
interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Typed fetch wrapper.
 *
 * - Attaches `Authorization: Bearer <token>` automatically (from session or explicit arg).
 * - Pass `null` as `explicitToken` to make an unauthenticated request.
 * - Throws on non-2xx — callers should catch and fall back to seed data.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  explicitToken?: string | null
): Promise<T> {
  const token = explicitToken !== undefined ? explicitToken : getStoredToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    // Token expired or revoked — clear session and redirect to auth-ui
    localStorage.removeItem("ac_session");
    const authUiUrl = (import.meta as any).env?.VITE_AUTH_UI_URL ?? "http://localhost:8098";
    const callbackUrl = `${window.location.origin}/auth/callback`;
    window.location.href = `${authUiUrl}/login?redirect_uri=${encodeURIComponent(callbackUrl)}`;
    throw new Error("[API] 401 session expired");
  }

  if (!res.ok) {
    throw new Error(`[API] ${res.status} ${path}`);
  }

  const json = (await res.json()) as ApiEnvelope<T>;
  // All backend responses wrap payload in { data: … }
  return (json.data ?? json) as T;
}
