import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { platformService } from "@/services/platformService";
import { AfrisincLoader } from "@/components/AfrisincLoader";
import {
  ArrowLeft,
  Bell,
  CreditCard,
  Shield,
  FileText,
  Fingerprint,
  ArrowRight,
} from "lucide-react";
import type { Product } from "@/contexts/PlatformContext";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  Bell,
  CreditCard,
  Shield,
  FileText,
  Fingerprint,
};

export default function ProductSelectorPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wsName, setWsName] = useState("");

  useEffect(() => {
    if (!workspaceId) return;
    Promise.all([
      platformService.getWorkspaceProducts(workspaceId),
      platformService.getUserWorkspaces(),
    ]).then(([prods, workspaces]) => {
      setProducts(prods);
      const ws = workspaces.find((w) => w.id === workspaceId);
      setWsName(ws?.name ?? "Workspace");
      setLoading(false);
    });
  }, [workspaceId]);

  function selectProduct(productId: string) {
    setSelectedId(productId);
    localStorage.setItem("afrisinc_active_product", productId);
    setTimeout(() => navigate("/", { replace: true }), 400);
  }

  if (loading) return <AfrisincLoader message="Loading products..." />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-1/3 -left-48 w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-3xl" />
      <div className="absolute bottom-1/4 -right-48 w-[400px] h-[400px] rounded-full bg-primary-light/[0.03] blur-3xl" />

      <div className="relative z-10 w-full max-w-2xl px-6">
        {/* Back */}
        <button
          onClick={() => navigate("/workspaces")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 animate-fade-in"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to workspaces</span>
        </button>

        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <h1 className="text-2xl font-bold text-foreground">Choose a Product</h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Select a product in <span className="font-medium text-foreground">{wsName}</span>
          </p>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((product, i) => {
            const Icon = ICON_MAP[product.icon] ?? Bell;
            return (
              <button
                key={product.id}
                onClick={() => selectProduct(product.id)}
                className={cn(
                  "flex items-start gap-4 p-5 rounded-xl border bg-card text-left transition-all duration-200 group animate-fade-in-up",
                  selectedId === product.id
                    ? "border-primary ring-2 ring-primary/20 shadow-md"
                    : "border-border hover:border-primary/40 hover:shadow-sm"
                )}
                style={{ animationDelay: `${(i + 1) * 80}ms` }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `hsl(${product.color} / 0.12)` }}
                >
                  <Icon className="h-5 w-5" style={{ color: `hsl(${product.color})` }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{product.name}</p>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {product.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
