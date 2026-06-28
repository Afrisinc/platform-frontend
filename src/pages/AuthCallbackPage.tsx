import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "@/services/authService";
import { AfrisincLoader } from "@/components/AfrisincLoader";

/**
 * AuthCallbackPage — /auth/callback
 *
 * Receives the OAuth authorization code from the auth-ui-service redirect,
 * exchanges it for a JWT via the API gateway, stores the session, then
 * navigates the user into the platform.
 *
 * Flow:
 *   auth-ui login → auth-service issues code → redirect here with ?code=xxx
 *   → POST /oauth/exchange → GET /users/profile → store SESSION_KEY → navigate "/"
 */
export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      setError("No authorization code provided. Redirecting to login…");
      setTimeout(() => authService.redirectToAuthUI(), 2000);
      return;
    }

    handleExchange(code);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleExchange(code: string) {
    try {
      const session = await authService.exchangeCode(code);
      authService.storeSession(session);
      navigate("/select-product", { replace: true });
    } catch {
      setError("Authentication failed. Redirecting to login…");
      setTimeout(() => authService.redirectToAuthUI(), 2000);
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-destructive text-2xl">!</span>
          </div>
          <p className="text-foreground font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return <AfrisincLoader message="Signing you in…" submessage="Verifying your credentials" />;
}
