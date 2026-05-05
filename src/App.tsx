import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import { SESSION_KEY } from "./contexts/PlatformContext";

const queryClient = new QueryClient();

/**
 * ProtectedRoute — checks localStorage for a valid session.
 * If none exists, redirects to /login before the platform renders.
 * This runs on every navigation so manual URL-typing is also caught.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const hasSession = Boolean(localStorage.getItem(SESSION_KEY));
  if (!hasSession) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

/**
 * GuestRoute — if the user is already logged in and tries to visit /login,
 * send them straight back to the platform.
 */
function GuestRoute({ children }: { children: React.ReactNode }) {
  const hasSession = Boolean(localStorage.getItem(SESSION_KEY));
  if (hasSession) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Platform — requires active session */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />

          {/* Login — redirects away if already authenticated */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />

          {/* Auth callback for SSO / magic link (future) */}
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
