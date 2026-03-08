import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Check, Bell, Users, CreditCard, BarChart3, LayoutGrid } from "lucide-react";
import { usePlatform, Product } from "@/contexts/PlatformContext";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  Bell, Users, CreditCard, BarChart3,
};

export function ProductSwitcher() {
  const { products, currentProduct } = usePlatform();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (product: Product | null) => {
    setOpen(false);
    if (product) {
      navigate(`/products/${product.id}`);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors text-sm font-medium"
      >
        {currentProduct ? (
          <>
            {(() => { const Icon = iconMap[currentProduct.icon]; return Icon ? <Icon className="h-4 w-4 text-primary" /> : null; })()}
            <span className="hidden md:inline">{currentProduct.name}</span>
          </>
        ) : (
          <>
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
            <span className="hidden md:inline">All Products</span>
          </>
        )}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-72 bg-popover border border-border rounded-xl shadow-lg z-50 p-1.5 animate-fade-in">
            <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Switch Product</p>
            
            {/* Back to Platform */}
            <button
              onClick={() => handleSelect(null)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors",
                !currentProduct ? "bg-accent text-accent-foreground" : "hover:bg-secondary"
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <LayoutGrid className="h-4 w-4" />
              </div>
              <div className="text-left">
                <span className="font-medium">Platform Hub</span>
                <p className="text-xs text-muted-foreground">Back to all products</p>
              </div>
              {!currentProduct && <Check className="h-4 w-4 ml-auto text-primary" />}
            </button>

            <div className="border-t border-border my-1" />

            {products.map((p) => {
              const Icon = iconMap[p.icon];
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors",
                    currentProduct?.id === p.id ? "bg-accent text-accent-foreground" : "hover:bg-secondary"
                  )}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `hsl(${p.color} / 0.12)`, color: `hsl(${p.color})` }}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                  </div>
                  <div className="text-left">
                    <span className="font-medium">{p.name}</span>
                    <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>
                  </div>
                  {currentProduct?.id === p.id && <Check className="h-4 w-4 ml-auto text-primary" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
