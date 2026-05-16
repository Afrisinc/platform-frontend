import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import { SESSION_KEY } from "./contexts/PlatformContext";
import { authService } from "./services/authService";

const queryClient = new QueryClient();

/**
 * ProtectedIndex — renders Index only if session exists.
 * Checks session ONCE on mount, not on every render.
 * This prevents logout on state changes and navigation.
 */
function ProtectedIndex() {
  useEffect(() => {
    // Only check session on mount/unmount
    const hasSession = Boolean(localStorage.getItem(SESSION_KEY));
    if (!hasSession) {
      authService.redirectToAuthUI();
    }
  }, []); // Empty deps: runs only once on mount

  return <Index />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth callback — receives SSO code from auth-ui-service */}
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Platform routes — all paths under /* render Index (session-protected) */}
          <Route path="/*" element={<ProtectedIndex />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
