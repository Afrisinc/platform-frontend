import { useEffect, useState } from "react";
import {
  Bell,
  Users,
  CreditCard,
  BarChart3,
  Shield,
  ArrowRight,
  Package,
  LogOut,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { productService } from "@/services/productService";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  getStoredUser,
  clearSession,
  type UserProduct,
  SESSION_KEY,
} from "@/contexts/PlatformContext";
import { cn } from "@/lib/utils";
import { authService } from "@/services/authService";

/** Get the JWT token from stored session. */
function getAuthToken(): string | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as { token?: string };
    return session.token ?? null;
  } catch {
    return null;
  }
}

function handleSignOut() {
  clearSession();
  authService.redirectToAuthUI();
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Bell,
  Users,
  CreditCard,
  BarChart3,
  Shield,
  Package,
};

/** Status badge styling based on product status. */
const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  LIVE: {
    bg: "bg-success/10",
    text: "text-success",
    border: "border-success/20",
    label: "Live",
  },
  BETA: {
    bg: "bg-warning/10",
    text: "text-warning",
    border: "border-warning/20",
    label: "Beta",
  },
  INACTIVE: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
    label: "Inactive",
  },
};

/** Plan badge styling. */
const PLAN_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  FREE: { bg: "bg-muted/50", text: "text-muted-foreground", border: "border-border" },
  PRO: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  ENTERPRISE: { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/20" },
};

function ProductCardSkeleton() {
  return (
    <div className="group relative bg-card rounded-2xl border border-border p-6 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-muted shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-5 bg-muted rounded w-24" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-3/4" />
        </div>
      </div>
    </div>
  );
}

export default function ProductSelectionPage() {
  const [products, setProducts] = useState<UserProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const user = getStoredUser();

  useEffect(() => {
    async function loadProducts() {
      try {
        setError(null);
        const userProducts = await productService.getUserProducts();
        setProducts(userProducts);
      } catch (err) {
        setError("Failed to load products. Please try again.");
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  function handleSelectProduct(product: UserProduct) {
    localStorage.setItem("selected_product", product.id);

    // Get the current auth token
    const token = getAuthToken();

    if (!token) {
      // No token - redirect to auth
      authService.redirectToAuthUI();
      return;
    }

    // Build the redirect URL to the external product app
    const baseUrl = product.baseUrl.replace(/\/$/, ""); // Remove trailing slash
    const redirectUrl = `${baseUrl}/sso/callback?token=${encodeURIComponent(token)}`;

    // Redirect to the external product dashboard
    globalThis.location.href = redirectUrl;
  }

  function handleRetry() {
    setLoading(true);
    setError(null);
    productService
      .getUserProducts()
      .then(setProducts)
      .catch(() => setError("Failed to load products. Please try again."))
      .finally(() => setLoading(false));
  }

  const firstName = user?.name?.split(" ")[0] || "there";
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  // Filter to only show products with active enrollment
  const activeProducts = products.filter((p) => p.enrollment.status === "ACTIVE");

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-primary/[0.02] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/[0.02] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Top navigation bar */}
      <header className="relative border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/afrisic-logo.png"
              alt="Afrisinc"
              className="w-9 h-9 rounded-xl object-contain"
            />
            <span className="font-semibold text-foreground tracking-tight">Afrisinc</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
              <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">{userInitials}</span>
              </div>
              <span className="text-sm font-medium text-foreground">{user?.name || "User"}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative max-w-5xl mx-auto px-6 py-12">
        {/* Welcome section */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-primary">Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">
            Welcome back, {firstName}
          </h1>
          <p className="text-muted-foreground text-lg">
            Select a product to access its dashboard and manage your services.
          </p>
        </div>

        {/* Products section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Your Products
              </h2>
              {!loading && !error && activeProducts.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {activeProducts.length}
                </span>
              )}
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl border border-destructive/20 bg-destructive/5">
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
                <AlertCircle className="w-7 h-7 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Unable to load products
              </h3>
              <p className="text-muted-foreground text-center max-w-sm mb-6">{error}</p>
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Try Again
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && activeProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-6 rounded-2xl border-2 border-dashed border-border bg-muted/20">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No products available</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                You don't have access to any products yet. Contact your administrator to request
                access.
              </p>
              <button className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                Contact Support
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Product grid */}
          {!loading && !error && activeProducts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeProducts.map((product) => {
                const iconName = productService.getProductIcon(product.code);
                const color = productService.getProductColor(product.code);
                const IconComponent = ICON_MAP[iconName] || Package;
                const isHovered = hoveredProduct === product.id;
                const statusStyle = STATUS_STYLES[product.status] || STATUS_STYLES.INACTIVE;
                const planStyle = PLAN_STYLES[product.enrollment.plan] || PLAN_STYLES.FREE;

                return (
                  <button
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    onMouseEnter={() => setHoveredProduct(product.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                    className={cn(
                      "group relative text-left w-full rounded-2xl border bg-card p-6 transition-all duration-200",
                      "hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30",
                      "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-background",
                      isHovered && "border-primary/30 shadow-lg shadow-primary/5"
                    )}
                  >
                    {/* Hover gradient overlay */}
                    <div
                      className={cn(
                        "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200 pointer-events-none",
                        "bg-gradient-to-br from-primary/[0.03] to-transparent",
                        isHovered && "opacity-100"
                      )}
                    />

                    <div className="relative flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-200",
                          isHovered && "scale-105"
                        )}
                        style={{
                          backgroundColor: `hsl(${color} / 0.12)`,
                          boxShadow: isHovered ? `0 8px 24px -8px hsl(${color} / 0.25)` : "none",
                        }}
                      >
                        <IconComponent
                          className="w-7 h-7 transition-transform duration-200"
                          style={{ color: `hsl(${color})` }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h3
                            className={cn(
                              "font-semibold text-foreground transition-colors duration-200",
                              isHovered && "text-primary"
                            )}
                          >
                            {product.name}
                          </h3>
                          <span
                            className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border",
                              statusStyle.bg,
                              statusStyle.text,
                              statusStyle.border
                            )}
                          >
                            {statusStyle.label}
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border",
                              planStyle.bg,
                              planStyle.text,
                              planStyle.border
                            )}
                          >
                            {product.enrollment.plan}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {product.description || "No description available"}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-2">
                          {product.enrollment.accountType === "ORGANIZATION"
                            ? "Organization account"
                            : "Individual account"}
                        </p>
                      </div>

                      {/* Arrow indicator */}
                      <div
                        className={cn(
                          "shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                          "bg-muted/50 text-muted-foreground",
                          isHovered && "bg-primary text-primary-foreground translate-x-1"
                        )}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Bottom accent line */}
                    <div
                      className={cn(
                        "absolute bottom-0 left-6 right-6 h-0.5 rounded-full transition-all duration-300",
                        isHovered ? "opacity-100" : "opacity-0"
                      )}
                      style={{ backgroundColor: `hsl(${color})` }}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick tip */}
        {!loading && !error && activeProducts.length > 0 && (
          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">Enter</span>
            <span>to select</span>
            <span className="mx-1">·</span>
            <span className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">Tab</span>
            <span>to navigate</span>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 border-t border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Afrisinc. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <button type="button" className="hover:text-foreground transition-colors">
              Help
            </button>
            <button type="button" className="hover:text-foreground transition-colors">
              Privacy
            </button>
            <button type="button" className="hover:text-foreground transition-colors">
              Terms
            </button>
            <a
              href="https://afrisinc.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Website
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
