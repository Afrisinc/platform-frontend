import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import PlatformResolverPage from "./pages/PlatformResolverPage";
import WorkspaceSelectorPage from "./pages/WorkspaceSelectorPage";
import ProductSelectorPage from "./pages/ProductSelectorPage";
import CreateWorkspacePage from "./pages/CreateWorkspacePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/platform" element={<PlatformResolverPage />} />
          <Route path="/workspaces" element={<WorkspaceSelectorPage />} />
          <Route path="/create-workspace" element={<CreateWorkspacePage />} />
          <Route path="/workspace/:workspaceId/products" element={<ProductSelectorPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
