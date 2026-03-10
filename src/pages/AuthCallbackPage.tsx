import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "@/services/authService";
import { AfrisincLoader } from "@/components/AfrisincLoader";

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      // For demo: simulate a valid code so the flow works without a real auth server
      handleExchange("demo_code");
      return;
    }

    handleExchange(code);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleExchange(code: string) {
    try {
      const { user, tokens } = await authService.exchangeCode(code);
      authService.storeTokens(tokens);
      authService.storeUser(user);
      navigate("/platform", { replace: true });
    } catch {
      setError("Authentication failed. Redirecting to login...");
      setTimeout(() => {
        // In production: redirect to auth.afrisinc.com/login
        navigate("/", { replace: true });
      }, 2000);
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

  return <AfrisincLoader message="Signing you in..." submessage="Verifying your credentials" />;
}
