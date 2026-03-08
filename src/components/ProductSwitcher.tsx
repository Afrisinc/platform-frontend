import { useState } from "react";
import { ChevronDown, Check, Bell, Users, CreditCard, BarChart3, LayoutGrid } from "lucide-react";
import { usePlatform, Product } from "@/contexts/PlatformContext";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  Bell, Users, CreditCard, BarChart3,
};

export function ProductSwitcher() {
  const { products, currentProduct, setCurrentProduct } = usePlatform();
  const [open, setOpen] = useState(false);

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
          <div className="absolute top-full left-0 mt-1 w-64 bg-popover border border-border rounded-xl shadow-lg z-50 p-1.5 animate-fade-in">
            <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Products</p>
            <button
              onClick={() => { setCurrentProduct(null); setOpen(false); }}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors",
                !currentProduct ? "bg-accent text-accent-foreground" : "hover:bg-secondary"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="font-medium">All Products</span>
              {!currentProduct && <Check className="h-4 w-4 ml-auto text-primary" />}
            </button>
            {products.map((p) => {
              const Icon = iconMap[p.icon];
              return (
                <button
                  key={p.id}
                  onClick={() => { setCurrentProduct(p); setOpen(false); }}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors",
                    currentProduct?.id === p.id ? "bg-accent text-accent-foreground" : "hover:bg-secondary"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <div className="text-left">
                    <span className="font-medium">{p.name}</span>
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
