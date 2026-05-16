import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { platformService } from "@/services/platformService";
import { authService } from "@/services/authService";
import { AfrisincLoader } from "@/components/AfrisincLoader";

type ResolverStep = "auth" | "workspaces" | "product" | "redirecting";

const STEP_MESSAGES: Record<ResolverStep, string> = {
  auth: "Verifying session...",
  workspaces: "Preparing your workspace...",
  product: "Loading your products...",
  redirecting: "Almost there...",
};

export default function PlatformResolverPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<ResolverStep>("auth");

  useEffect(() => {
    resolve();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function resolve() {
    // Step 1: Verify authentication — redirect to auth-ui if no session
    if (!authService.isAuthenticated()) {
      authService.redirectToAuthUI();
      return;
    }

    // Step 2: Fetch workspaces
    setStep("workspaces");
    const workspaces = await platformService.getUserWorkspaces();

    // Case 1: No workspaces
    if (workspaces.length === 0) {
      navigate("/create-workspace", { replace: true });
      return;
    }

    // Case 2 & 3: Resolve active workspace
    let workspaceId: string | null = null;
    const storedWs = localStorage.getItem("afrisinc_active_workspace");

    if (storedWs && workspaces.some((w) => w.id === storedWs)) {
      workspaceId = storedWs;
    } else if (workspaces.length === 1) {
      workspaceId = workspaces[0].id;
      localStorage.setItem("afrisinc_active_workspace", workspaceId);
    } else {
      // Multiple workspaces, no stored selection
      navigate("/workspaces", { replace: true });
      return;
    }

    // Step 3: Resolve product
    setStep("product");
    const storedProduct = localStorage.getItem("afrisinc_active_product");

    if (storedProduct) {
      const hasAccess = await platformService.validateProductAccess(workspaceId, storedProduct);
      if (hasAccess) {
        setStep("redirecting");
        navigate("/", { replace: true });
        return;
      }
    }

    // No stored product or invalid — go to product selector
    navigate(`/workspace/${workspaceId}/products`, { replace: true });
  }

  return <AfrisincLoader message={STEP_MESSAGES[step]} submessage="Setting up your experience" />;
}
